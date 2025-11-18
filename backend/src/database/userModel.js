const db = require('./db');

const parseParams = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (err) {
      return null;
    }
  }
  return value;
};

const mapUser = (row) =>
  row
    ? {
        ...row,
        params: parseParams(row.params),
      }
    : null;

const createUser = async ({
  username,
  email,
  hash,
  algorithm,
  salt,
  params,
}) => {
  const result = await db.query(
    `
    INSERT INTO users (username, email, hash, algorithm, salt, params)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,
    [username, email, hash, algorithm, salt, params ? JSON.stringify(params) : null]
  );

  return mapUser(result.rows[0]);
};

const findUserByUsername = async (username) => {
  const result = await db.query(
    'SELECT * FROM users WHERE username = $1 LIMIT 1',
    [username]
  );
  return mapUser(result.rows[0]);
};

const findUserById = async (id) => {
  const result = await db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [
    id,
  ]);
  return mapUser(result.rows[0]);
};

const listUsers = async () => {
  const result = await db.query(
    `
    SELECT id, username, email, hash, algorithm, salt, params, created_at
    FROM users
    ORDER BY created_at DESC
  `
  );
  return result.rows.map(mapUser);
};

const deleteUser = async (id) => {
  const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  return result.rows.length > 0 ? mapUser(result.rows[0]) : null;
};

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
  listUsers,
  deleteUser,
};


