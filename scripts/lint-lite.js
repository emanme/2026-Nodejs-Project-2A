const fs = require('fs');
const path = require('path');

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.js')) out.push(p);
  }
  return out;
}

const files = walk(path.join(__dirname, '..', 'src'));
for (const f of files) {
  const s = fs.readFileSync(f, 'utf-8');
  if (s.includes('== null')) console.warn('[lint-lite] Prefer strict checks:', f);
}
