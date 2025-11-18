const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../wordlists');

const baseWords = [
  'password',
  '123456',
  'letmein',
  'admin',
  'qwerty',
  'iloveyou',
  'welcome',
  'ninja',
  'sunshine',
  'princess',
  'dragon',
  'football',
  'monkey',
  'shadow',
  'master',
  'killer',
  'trustno1',
  'passw0rd',
  'zaq1zaq1',
  'baseball',
];

const randomWord = (prefix, length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let word = prefix || '';
  while (word.length < length) {
    word += chars[Math.floor(Math.random() * chars.length)];
  }
  return word;
};

const generate = (fileName, total) => {
  const lines = [];
  for (let i = 0; i < total; i += 1) {
    if (i < baseWords.length) {
      lines.push(baseWords[i]);
    } else {
      lines.push(`${randomWord('', 4)}${i}`);
    }
  }
  fs.writeFileSync(path.join(dir, fileName), lines.join('\n'));
  console.log(`Generated ${fileName} (${total} lines)`);
};

generate('small.txt', 100);
generate('medium.txt', 1000);
generate('rockyou-mini.txt', 10000);


