const { performance } = require('perf_hooks');

const start = () => performance.now();

const stop = (marker) => performance.now() - marker;

const measureAsync = async (fn) => {
  const marker = start();
  const result = await fn();
  const durationMs = stop(marker);
  return { result, durationMs };
};

module.exports = {
  start,
  stop,
  measureAsync,
};


