const path = require('path');
const styles = path.join(__dirname, 'styles');
const dist = path.join(__dirname, 'project-dist', 'bundle.css');

bundleFile(styles, dist);

function bundleFile(fromFolder, toFile) {
  const fs = require('fs');
  const path = require('path');
  const ws = fs.createWriteStream(toFile, 'utf-8');
  fs.readdir(fromFolder, {withFileTypes: true, encoding: 'utf-8'}, (err, files) => {
    if(err) return console.log(err);
    files
      .filter(file => file.isFile())
      .filter(file => path.parse(file.name).ext == '.css')
      .forEach(file => {
        const filePath = path.join(fromFolder, file.name);
        const rs = fs.createReadStream(filePath);
        rs.pipe(ws);
      })
  });
}