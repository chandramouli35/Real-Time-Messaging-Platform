const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      if (dirPath.endsWith('.js') || dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
        callback(dirPath);
      }
    }
  }
}

walkDir(path.join(__dirname, 'backend'), (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/\\\${/g, '${').replace(/\\`/g, '`');
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log('Fixed', filePath);
  }
});

walkDir(path.join(__dirname, 'frontend', 'src'), (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/\\\${/g, '${').replace(/\\`/g, '`');
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log('Fixed', filePath);
  }
});
