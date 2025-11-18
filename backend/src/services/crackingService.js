const path = require('path');
const { Worker } = require('worker_threads');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/env');
const userModel = require('../database/userModel');
const jobModel = require('../database/crackJobModel');
const wordlistService = require('./wordlistService');

const activeJobs = new Map();

const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createJob = async ({
  userId,
  attackType,
  wordlistId,
  wordlistId2,
  maxLength,
  charset,
  hybridSuffixLength,
  hybridSuffixCharset,
  maskPattern,
  ruleTypes,
}) => {
  if (activeJobs.size >= config.cracking.maxConcurrentJobs) {
    throw new Error('Cracking capacity reached. Try again later.');
  }

  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Validate attack type requirements
  if ((attackType === 'dictionary' || attackType === 'hybrid' || attackType === 'rule' || attackType === 'togglecase') && !wordlistId) {
    throw new Error('Wordlist is required for dictionary, hybrid, rule-based, and toggle case attacks');
  }

  if (attackType === 'combinator' && (!wordlistId || !wordlistId2)) {
    throw new Error('Both wordlists are required for combinator attacks');
  }

  if (attackType === 'mask' && !maskPattern) {
    throw new Error('Mask pattern is required for mask attacks');
  }

  const jobId = uuidv4();

  const wordlistMeta =
    attackType === 'dictionary' || attackType === 'hybrid' || attackType === 'rule' || attackType === 'togglecase' || attackType === 'combinator'
      ? wordlistService.getWordlistPath(wordlistId)
      : null;

  const wordlistMeta2 =
    attackType === 'combinator'
      ? wordlistService.getWordlistPath(wordlistId2)
      : null;

  const jobRecord = await jobModel.insertJob({
    id: jobId,
    userId: user.id,
    attackType,
    wordlist: wordlistMeta ? wordlistMeta.id : null,
    maxLength: maxLength || null,
    charset: charset || null,
    status: 'queued',
  });

  const attackConfig = {
    type: attackType,
    wordlistPath: wordlistMeta ? wordlistMeta.absolutePath : null,
    maxLength: maxLength || 4,
    charset:
      charset ||
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  };

  // Add hybrid attack config
  if (attackType === 'hybrid') {
    attackConfig.hybridSuffixLength = hybridSuffixLength || 2;
    attackConfig.hybridSuffixCharset = hybridSuffixCharset || '0123456789';
  }

  // Add mask attack config
  if (attackType === 'mask') {
    attackConfig.maskPattern = maskPattern || '?l?l?d?d';
  }

  // Add rule-based attack config
  if (attackType === 'rule') {
    attackConfig.ruleTypes = ruleTypes || [];
  }

  // Add combinator attack config
  if (attackType === 'combinator') {
    attackConfig.wordlistPath2 = wordlistMeta2 ? wordlistMeta2.absolutePath : null;
  }

  const worker = new Worker(
    path.resolve(__dirname, '../workers/crackWorker.js'),
    {
      workerData: {
        jobId,
        user: {
          id: user.id,
          algorithm: user.algorithm,
          hash: user.hash,
          salt: user.salt,
          params: user.params,
        },
        attack: attackConfig,
      },
    }
  );

  activeJobs.set(jobId, worker);
  await jobModel.updateJob(jobId, { status: 'running' });

  const cleanup = () => {
    if (activeJobs.has(jobId)) {
      activeJobs.delete(jobId);
    }
  };

  worker.on('message', async (message) => {
    if (message.type === 'done') {
      await jobModel.updateJob(jobId, {
        status: message.success ? 'completed' : 'failed',
        finishedAt: new Date().toISOString(),
        totalTimeMs: message.totalTimeMs,
        attempts: message.attempts,
        attemptsPerSec: message.attemptsPerSec,
        foundPassword: message.password || null,
      });
      cleanup();
    }
  });

  worker.on('error', async (error) => {
    console.error('Worker error', error);
    await jobModel.updateJob(jobId, {
      status: 'failed',
      finishedAt: new Date().toISOString(),
    });
    cleanup();
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.warn(`Worker exited with code ${code}`);
    }
    cleanup();
  });

  return jobRecord;
};

const getJob = async (jobId) => jobModel.getJobById(jobId);

const listJobs = async () => jobModel.listJobsWithUsers();

const cancelJob = async (jobId) => {
  const job = await jobModel.getJobById(jobId);
  if (!job) {
    throw createError('Job not found', 404);
  }

  // If job is already not running, return it as-is (idempotent operation)
  if (job.status !== 'running') {
    return job;
  }

  const worker = activeJobs.get(jobId);
  
  // If worker exists, terminate it
  if (worker) {
    await worker.terminate();
    activeJobs.delete(jobId);
  }
  
  // Update job status to cancelled regardless of whether worker was found
  // This handles the case where worker finished but status wasn't updated yet
  return jobModel.updateJob(jobId, {
    status: 'cancelled',
    finishedAt: new Date().toISOString(),
  });
};

const getStats = async () => {
  const jobs = await listJobs();
  const stats = {
    total: jobs.length,
    success: jobs.filter((job) => job.status === 'completed' && job.found_password)
      .length,
    failed: jobs.filter((job) => job.status === 'failed').length,
    running: jobs.filter((job) => job.status === 'running').length,
    datasets: {},
  };

  jobs.forEach((job) => {
    const key = job.algorithm;
    if (!stats.datasets[key]) {
      stats.datasets[key] = [];
    }
    if (job.total_time_ms) {
      stats.datasets[key].push({
        jobId: job.id,
        userId: job.user_id,
        attempts: Number(job.attempts || 0),
        totalTimeMs: Number(job.total_time_ms || 0),
        attemptsPerSec: Number(job.attempts_per_sec || 0),
        status: job.status,
        foundPassword: job.found_password,
      });
    }
  });

  return stats;
};

const deleteJob = async (jobId) => {
  const job = await jobModel.getJobById(jobId);
  if (!job) {
    throw createError('Job not found', 404);
  }

  // Nếu job đang chạy, cần cancel trước
  if (job.status === 'running') {
    const worker = activeJobs.get(jobId);
    if (worker) {
      await worker.terminate();
      activeJobs.delete(jobId);
    }
  }

  return jobModel.deleteJob(jobId);
};

const deleteAllJobs = async () => {
  // Cancel tất cả jobs đang chạy
  for (const [jobId, worker] of activeJobs.entries()) {
    try {
      await worker.terminate();
    } catch (error) {
      console.error(`Error terminating worker ${jobId}:`, error);
    }
  }
  activeJobs.clear();

  return jobModel.deleteAllJobs();
};

module.exports = {
  createJob,
  getJob,
  listJobs,
  getStats,
  cancelJob,
  deleteJob,
  deleteAllJobs,
  activeJobs,
};


