const fs = require('fs');
const path = require('path');

const WORDLIST_DIR = path.resolve(__dirname, '../../wordlists');

const WORDLISTS = [
  { id: 'small', file: 'small.txt', label: 'Small (100 lines)' },
  { id: 'medium', file: 'medium.txt', label: 'Medium (1k lines)' },
  { id: 'rockyou-mini', file: 'rockyou-mini.txt', label: 'RockYou Mini (10k)' },
];

const getWordlistPath = (id) => {
  const meta = WORDLISTS.find((item) => item.id === id);
  if (!meta) {
    throw new Error(`Unknown wordlist: ${id}`);
  }
  return {
    ...meta,
    absolutePath: path.join(WORDLIST_DIR, meta.file),
  };
};

const readWordlist = (id) => {
  const { absolutePath } = getWordlistPath(id);
  const content = fs.readFileSync(absolutePath, 'utf-8');
  return content.split(/\r?\n/).filter(Boolean);
};

const listWordlists = () =>
  WORDLISTS.map((meta) => ({
    id: meta.id,
    label: meta.label,
    file: meta.file,
  }));

module.exports = {
  listWordlists,
  getWordlistPath,
  readWordlist,
};


