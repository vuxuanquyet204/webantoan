const hashingService = require('../src/services/hashingService');
const { comparePassword } = require('../src/utils/hashComparator');

describe('hashingService.generateHash', () => {
  const password = 'Pa$$w0rd!';

  it('generates bcrypt hashes with normalized params', async () => {
    const { hash, params, salt } = await hashingService.generateHash({
      algorithm: 'bcrypt',
      password,
      params: { rounds: 'abc' },
    });

    expect(hash).toEqual(expect.any(String));
    expect(hash).not.toBe(password);
    expect(params).toEqual({ rounds: 10 });
    expect(salt).toBeNull();

    const verified = await comparePassword({
      algorithm: 'bcrypt',
      password,
      hash,
    });
    expect(verified).toBe(true);
  });

  it('generates argon2id hashes with fallback parameter values', async () => {
    const { hash, params, salt } = await hashingService.generateHash({
      algorithm: 'argon2id',
      password,
      params: { memoryCost: 8192 },
    });

    expect(hash).toEqual(expect.any(String));
    expect(params).toEqual({
      memoryCost: 8192,
      timeCost: 3,
      parallelism: 1,
    });
    expect(salt).toBeNull();

    const verified = await comparePassword({
      algorithm: 'argon2id',
      password,
      hash,
      params,
    });
    expect(verified).toBe(true);
  });

  it('supports salted legacy hashes (md5/sha1)', async () => {
    const { hash, salt, params } = await hashingService.generateHash({
      algorithm: 'md5',
      password,
      params: { useSalt: true },
    });

    expect(typeof salt).toBe('string');
    expect(salt).toHaveLength(16);
    expect(params).toEqual({ useSalt: true });

    const verified = await comparePassword({
      algorithm: 'md5',
      password,
      hash,
      salt,
    });
    expect(verified).toBe(true);
  });

  it('throws for unsupported algorithms', async () => {
    await expect(
      hashingService.generateHash({ algorithm: 'unknown', password })
    ).rejects.toThrow('Unsupported algorithm: unknown');
  });
});

