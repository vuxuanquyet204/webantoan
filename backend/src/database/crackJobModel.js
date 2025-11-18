const db = require('./db');

const insertJob = async ({
  id,
  userId,
  attackType,
  wordlist,
  maxLength,
  charset,
  status = 'pending',
}) => {
  const result = await db.query(
    `
    INSERT INTO crack_jobs (id, user_id, attack_type, wordlist, max_length, charset, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,
    [id, userId, attackType, wordlist, maxLength, charset, status]
  );
  return result.rows[0];
};

const updateJob = async (
  id,
  { status, finishedAt, totalTimeMs, attempts, attemptsPerSec, foundPassword }
) => {
  const result = await db.query(
    `
    UPDATE crack_jobs
    SET status = COALESCE($2, status),
        finished_at = COALESCE($3, finished_at),
        total_time_ms = COALESCE($4, total_time_ms),
        attempts = COALESCE($5, attempts),
        attempts_per_sec = COALESCE($6, attempts_per_sec),
        found_password = COALESCE($7, found_password)
    WHERE id = $1
    RETURNING *
  `,
    [id, status, finishedAt, totalTimeMs, attempts, attemptsPerSec, foundPassword]
  );
  return result.rows[0];
};

const getJobById = async (id) => {
  const result = await db.query('SELECT * FROM crack_jobs WHERE id = $1', [
    id,
  ]);
  return result.rows[0];
};

const listJobsWithUsers = async () => {
  const result = await db.query(`
    SELECT
      cj.*,
      u.username,
      u.algorithm
    FROM crack_jobs cj
    JOIN users u ON u.id = cj.user_id
    ORDER BY cj.started_at DESC
  `);
  return result.rows;
};

const deleteJob = async (id) => {
  const result = await db.query('DELETE FROM crack_jobs WHERE id = $1 RETURNING *', [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

const deleteAllJobs = async () => {
  const result = await db.query('DELETE FROM crack_jobs RETURNING *');
  return result.rows.length;
};

module.exports = {
  insertJob,
  updateJob,
  getJobById,
  listJobsWithUsers,
  deleteJob,
  deleteAllJobs,
};


