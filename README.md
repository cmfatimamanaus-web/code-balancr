# Code Sentinel

cd /home/claude/build && wc -l TesouroEspiritual.jsx && node -e "
const fs = require('fs');
let content = fs.readFileSync('TesouroEspiritual.jsx', 'utf8');
// quick brace/paren balance check
const pairs = {'(' : ')', '{': '}', '[': ']'};
let stack = [];
let inStr = false, strCh = '';
for (let i=0;i<content.length;i++){
  const c = content[i];
  if (inStr){
    if (c === strCh && content[i-1] !== '\\\\') inStr = false;
    continue;
  }
  if (c === '\"' || c === \"'\" || c === '\`'){ inStr = true; strCh = c; continue; }
  if ('({['.includes(c)) stack.push(c);
  else if (')}]'.includes(c)){
    const open = stack.pop();
    if (pairs[open] !== c){ console.log('MISMATCH at', i, open, c); process.exit(1);}
  }
}
console.log('stack remaining:', stack.length, stack.slice(-10));

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://code-balancr.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/13427fe8-59fe-4db4-97dc-a2128ff368ba).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
