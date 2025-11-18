const bcrypt = require('bcrypt');
const argon2 = require('argon2');
const crypto = require('crypto');

const legacyHash = (algorithm, password, salt = '') => {
  const normalized = salt ? `${salt}:${password}` : password;
  return crypto.createHash(algorithm).update(normalized).digest('hex');
};

const comparePassword = async ({
  algorithm,
  password,
  hash,
  salt,
  params = {},
}) => {
  switch (algorithm) {
    case 'bcrypt':
      return bcrypt.compare(password, hash);
    case 'argon2id':
      return argon2.verify(hash, password, params);
    case 'md5':
    case 'sha1':
      return legacyHash(algorithm, password, salt) === hash;
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
};

module.exports = {
  comparePassword,
  legacyHash,
};


