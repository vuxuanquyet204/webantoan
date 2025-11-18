const crackingService = require('../services/crackingService');
const wordlistService = require('../services/wordlistService');

const createJob = async (req, res, next) => {
  try {
    const {
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
    } = req.body;
    if (!userId || !attackType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const job = await crackingService.createJob({
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
    });

    res.status(202).json(job);
  } catch (error) {
    next(error);
  }
};

const getJob = async (req, res, next) => {
  try {
    const job = await crackingService.getJob(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
};

const listJobs = async (_req, res, next) => {
  try {
    const jobs = await crackingService.listJobs();
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

const cancelJob = async (req, res, next) => {
  try {
    const job = await crackingService.cancelJob(req.params.id);
    res.json(job);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

const getStats = async (_req, res, next) => {
  try {
    const stats = await crackingService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

const listWordlists = (_req, res, next) => {
  try {
    res.json(wordlistService.listWordlists());
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const job = await crackingService.deleteJob(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully', id });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

const deleteAllJobs = async (_req, res, next) => {
  try {
    const deletedCount = await crackingService.deleteAllJobs();
    res.json({ message: 'All jobs deleted successfully', deletedCount });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJob,
  listJobs,
  getStats,
  listWordlists,
  cancelJob,
  deleteJob,
  deleteAllJobs,
};


