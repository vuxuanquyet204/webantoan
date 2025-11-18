const fs = require('fs');
const { parentPort, workerData } = require('worker_threads');
const { performance } = require('perf_hooks');
const { comparePassword } = require('../utils/hashComparator');

const attemptCandidate = async (candidate, user) =>
  comparePassword({
    algorithm: user.algorithm,
    password: candidate,
    hash: user.hash,
    salt: user.salt,
    params: user.params || {},
  });

const dictionaryAttack = async (attackConfig, user) => {
  const wordlist = fs.readFileSync(attackConfig.wordlistPath, 'utf-8');
  const candidates = wordlist.split(/\r?\n/).filter(Boolean);
  let attempts = 0;

  for (const candidate of candidates) {
    attempts += 1;
    const match = await attemptCandidate(candidate, user);
    if (match) {
      return { success: true, password: candidate, attempts };
    }
  }

  return { success: false, password: null, attempts };
};

const bruteForceAttack = async (attackConfig, user) => {
  const charset = attackConfig.charset.split('');
  const maxLength = Math.min(attackConfig.maxLength || 4, 5);
  const state = { attempts: 0, password: null };

  const recurse = async (prefix) => {
    if (state.password) return;
    if (prefix.length > 0) {
      state.attempts += 1;
      const match = await attemptCandidate(prefix, user);
      if (match) {
        state.password = prefix;
        return;
      }
    }
    if (prefix.length >= maxLength) {
      return;
    }
    for (const char of charset) {
      if (state.password) break;
      await recurse(prefix + char);
    }
  };

  await recurse('');
  return {
    success: Boolean(state.password),
    password: state.password,
    attempts: state.attempts,
  };
};

const hybridAttack = async (attackConfig, user) => {
  const wordlist = fs.readFileSync(attackConfig.wordlistPath, 'utf-8');
  const baseWords = wordlist.split(/\r?\n/).filter(Boolean);
  const suffixCharset = (attackConfig.hybridSuffixCharset || '0123456789').split('');
  const suffixLength = Math.min(attackConfig.hybridSuffixLength || 2, 3);
  let attempts = 0;

  const generateSuffixes = (length) => {
    if (length === 0) return [''];
    const suffixes = [];
    const shorter = generateSuffixes(length - 1);
    for (const suffix of shorter) {
      for (const char of suffixCharset) {
        suffixes.push(suffix + char);
      }
    }
    return suffixes;
  };

  const suffixes = generateSuffixes(suffixLength);

  for (const baseWord of baseWords) {
    for (const suffix of suffixes) {
      attempts += 1;
      const candidate = baseWord + suffix;
      const match = await attemptCandidate(candidate, user);
      if (match) {
        return { success: true, password: candidate, attempts };
      }
    }
  }

  return { success: false, password: null, attempts };
};

const maskAttack = async (attackConfig, user) => {
  const pattern = attackConfig.maskPattern || '?l?l?d?d';
  const charsets = {
    '?l': 'abcdefghijklmnopqrstuvwxyz',
    '?u': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '?d': '0123456789',
    '?s': '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  // Parse pattern into segments
  const segments = [];
  let i = 0;
  while (i < pattern.length) {
    if (pattern[i] === '?' && i + 1 < pattern.length) {
      const key = pattern.substring(i, i + 2);
      if (charsets[key]) {
        segments.push(charsets[key].split(''));
        i += 2;
      } else {
        i += 1;
      }
    } else {
      i += 1;
    }
  }

  if (segments.length === 0) {
    return { success: false, password: null, attempts: 0 };
  }

  let attempts = 0;
  const state = { password: null };

  const recurse = async (prefix, segmentIndex) => {
    if (state.password) return;
    if (segmentIndex >= segments.length) {
      attempts += 1;
      const match = await attemptCandidate(prefix, user);
      if (match) {
        state.password = prefix;
      }
      return;
    }

    for (const char of segments[segmentIndex]) {
      if (state.password) break;
      await recurse(prefix + char, segmentIndex + 1);
    }
  };

  await recurse('', 0);
  return {
    success: Boolean(state.password),
    password: state.password,
    attempts,
  };
};

const ruleBasedAttack = async (attackConfig, user) => {
  const wordlist = fs.readFileSync(attackConfig.wordlistPath, 'utf-8');
  const baseWords = wordlist.split(/\r?\n/).filter(Boolean);
  const rules = attackConfig.ruleTypes || [];
  let attempts = 0;

  const applyRules = (word) => {
    const variants = new Set([word]); // Start with original word

    for (const rule of rules) {
      const newVariants = new Set();
      
      for (const variant of variants) {
        switch (rule) {
          case 'lowercase':
            newVariants.add(variant.toLowerCase());
            break;
          case 'uppercase':
            newVariants.add(variant.toUpperCase());
            break;
          case 'capitalize':
            if (variant.length > 0) {
              newVariants.add(variant.charAt(0).toUpperCase() + variant.slice(1).toLowerCase());
            }
            break;
          case 'addNumbers':
            // Add numbers 0-9 at the end
            for (let i = 0; i <= 9; i++) {
              newVariants.add(variant + i);
            }
            // Add numbers 00-99 at the end (limited to avoid too many)
            for (let i = 0; i <= 99; i++) {
              newVariants.add(variant + String(i).padStart(2, '0'));
            }
            break;
          case 'addSymbols':
            // Add common symbols
            const symbols = ['!', '@', '#', '$', '%', '&', '*'];
            for (const sym of symbols) {
              newVariants.add(variant + sym);
            }
            break;
        }
        // Keep original variant
        newVariants.add(variant);
      }
      
      // Update variants for next rule iteration
      variants.clear();
      for (const v of newVariants) {
        variants.add(v);
      }
    }

    return Array.from(variants);
  };

  for (const baseWord of baseWords) {
    const candidates = applyRules(baseWord);
    for (const candidate of candidates) {
      attempts += 1;
      const match = await attemptCandidate(candidate, user);
      if (match) {
        return { success: true, password: candidate, attempts };
      }
    }
  }

  return { success: false, password: null, attempts };
};

const combinatorAttack = async (attackConfig, user) => {
  const wordlist1 = fs.readFileSync(attackConfig.wordlistPath, 'utf-8');
  const wordlist2 = fs.readFileSync(attackConfig.wordlistPath2, 'utf-8');
  const words1 = wordlist1.split(/\r?\n/).filter(Boolean);
  const words2 = wordlist2.split(/\r?\n/).filter(Boolean);
  let attempts = 0;

  // Try word1 + word2
  for (const word1 of words1) {
    for (const word2 of words2) {
      attempts += 1;
      const candidate = word1 + word2;
      const match = await attemptCandidate(candidate, user);
      if (match) {
        return { success: true, password: candidate, attempts };
      }
    }
  }

  return { success: false, password: null, attempts };
};

const toggleCaseAttack = async (attackConfig, user) => {
  const wordlist = fs.readFileSync(attackConfig.wordlistPath, 'utf-8');
  const baseWords = wordlist.split(/\r?\n/).filter(Boolean);
  let attempts = 0;

  // Generate all case variations of a word
  const generateCaseVariations = (word) => {
    const variations = new Set();
    const length = word.length;
    const maxVariations = Math.min(Math.pow(2, length), 1000); // Limit to 1000 variations to avoid too many

    // Generate all possible case combinations
    const generate = (prefix, remaining) => {
      if (variations.size >= maxVariations) return;
      if (remaining.length === 0) {
        variations.add(prefix);
        return;
      }

      const char = remaining[0];
      const rest = remaining.slice(1);

      if (/[a-zA-Z]/.test(char)) {
        // Try both lowercase and uppercase
        generate(prefix + char.toLowerCase(), rest);
        generate(prefix + char.toUpperCase(), rest);
      } else {
        // Non-letter characters stay the same
        generate(prefix + char, rest);
      }
    };

    generate('', word);
    return Array.from(variations);
  };

  for (const baseWord of baseWords) {
    const candidates = generateCaseVariations(baseWord);
    for (const candidate of candidates) {
      attempts += 1;
      const match = await attemptCandidate(candidate, user);
      if (match) {
        return { success: true, password: candidate, attempts };
      }
    }
  }

  return { success: false, password: null, attempts };
};

const run = async () => {
  const start = performance.now();
  let result;
  try {
    switch (workerData.attack.type) {
      case 'dictionary':
        result = await dictionaryAttack(workerData.attack, workerData.user);
        break;
      case 'bruteforce':
        result = await bruteForceAttack(workerData.attack, workerData.user);
        break;
      case 'hybrid':
        result = await hybridAttack(workerData.attack, workerData.user);
        break;
      case 'mask':
        result = await maskAttack(workerData.attack, workerData.user);
        break;
      case 'rule':
        result = await ruleBasedAttack(workerData.attack, workerData.user);
        break;
      case 'combinator':
        result = await combinatorAttack(workerData.attack, workerData.user);
        break;
      case 'togglecase':
        result = await toggleCaseAttack(workerData.attack, workerData.user);
        break;
      default:
        throw new Error(`Unknown attack type: ${workerData.attack.type}`);
    }
  } catch (error) {
    parentPort.postMessage({
      type: 'done',
      success: false,
      error: error.message,
      totalTimeMs: Math.round(performance.now() - start),
      attempts: result?.attempts || 0,
      attemptsPerSec: 0,
    });
    return;
  }

  const totalTimeMs = Math.round(performance.now() - start);
  const attemptsPerSec =
    totalTimeMs > 0 ? (result.attempts / totalTimeMs) * 1000 : 0;

  parentPort.postMessage({
    type: 'done',
    success: result.success,
    password: result.password,
    totalTimeMs,
    attempts: result.attempts,
    attemptsPerSec,
  });
};

run();


