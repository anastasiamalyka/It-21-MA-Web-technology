const fs = require('fs');
const path = require('path');

const read = (file) => {
  const p = path.join(__dirname, '..', 'data', file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8') || '[]');
};

const write = (file, data) => {
  const p = path.join(__dirname, '..', 'data', file);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
};

module.exports = { read, write };
