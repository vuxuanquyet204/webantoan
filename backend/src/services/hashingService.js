const bcrypt = require('bcrypt');
const argon2 = require('argon2');
const crypto = require('crypto');
const { comparePassword } = require('../utils/hashComparator');

const normalizeNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const generateHash = async ({ algorithm, password, params = {} }) => {
  switch (algorithm) {
    case 'bcrypt': {
      const rounds = normalizeNumber(params.rounds, 10);
      const hash = await bcrypt.hash(password, rounds);
      return { hash, salt: null, params: { rounds } };
    }
    case 'argon2id': {
      const memoryCost = normalizeNumber(params.memoryCost, 4096);
      const timeCost = normalizeNumber(params.timeCost, 3);
      const parallelism = normalizeNumber(params.parallelism, 1);
      const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost,
        timeCost,
        parallelism,
      });
      return {
        hash,
        salt: null,
        params: { memoryCost, timeCost, parallelism },
      };
    }
    case 'md5':
    case 'sha1': {
      const salt =
        typeof params.salt === 'string'
          ? params.salt
          : params.useSalt
          ? crypto.randomBytes(8).toString('hex')
          : '';
      const normalized = salt ? `${salt}:${password}` : password;
      const hash = crypto.createHash(algorithm).update(normalized).digest('hex');
      return {
        hash,
        salt: salt || null,
        params: { useSalt: Boolean(salt) },
      };
    }
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
};

const verifyPassword = async ({
  algorithm,
  password,
  hash,
  salt,
  params,
}) => comparePassword({ algorithm, password, hash, salt, params });

module.exports = {
  generateHash,
  verifyPassword,
};


