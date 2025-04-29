const fs = require('fs');
const path = require('path');

function printDirStructure(dirPath, indent = '') {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);

   
    if (file === 'node_modules') {
      return;
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      console.log(indent + '├── ' + file + '/');
      printDirStructure(filePath, indent + '│   ');
    } else {
      console.log(indent + '├── ' + file);
    }
  });
}


printDirStructure(path.join('D:\\PRUEBAS TECNICAS\\prueba_rimac_2025'));
