const fs = require('fs');
const path = require('path');

function findPngs(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(findPngs(fullPath));
      } else if (fullPath.endsWith('.png') || fullPath.endsWith('.jpg') || fullPath.endsWith('.jpeg')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

console.log(findPngs('.'));
