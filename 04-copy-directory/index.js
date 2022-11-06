const path = require('path');
const fs = require('fs');
const filesPath = path.join(__dirname, "files")
const copyPath = path.join(__dirname, "files-copy")

const makeDir = curPath => new Promise((resolve, reject) => {
  fs.mkdir(curPath, {recursive: true}, err => { if(err) reject(err.message); resolve() })
})

const rmDir = curPath => new Promise(resolve => {
  fs.rm(curPath, {recursive: true, force: true}, () => resolve())
})

const getFileList = fromPath => new Promise((resolve, reject) => {
  fs.readdir(fromPath, {withFileTypes: true}, (err, files) => {
    if(err) return reject(err.message)
    let fileLists = files.filter(file => file.isFile())
      .map(file => file.name);
    resolve(fileLists)
  })
})

const copyFile = (copyFile, toDir) => {
  let fileName = path.basename(copyFile)
  const rStream = fs.createReadStream(copyFile)
  const wStream = fs.createWriteStream(path.join(toDir, fileName))
  rStream.pipe(wStream)
  rStream.on('error', err => console.error(err.message))
}

const copyFolder = (filesPath, copyPath) => {
  rmDir(copyPath)
  .then(() => makeDir(copyPath))
  .then(() => getFileList(filesPath))
  .then(fileLists => 
    fileLists.forEach(file => {
      copyFile(path.join(filesPath, file), copyPath)
    }))
  .catch(err => console.error(err))
}

copyFolder(filesPath, copyPath)