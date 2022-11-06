const path = require('path');
const fs = require('fs');
const readline = require('readline');

const outDir = 'project-dist';
const inHtmlFile = path.join(__dirname, 'template.html');
const outHtmlFile = path.join(__dirname, outDir, 'index.html');
const inCssFolder = path.join(__dirname, 'styles');
const outCssFile = path.join(__dirname, outDir, 'style.css');
const inAssets = path.join(__dirname, 'assets');
const outAssets = path.join(__dirname, outDir, 'assets');

function copyAssets(inAssets, outAssets) {
  console.log('Copyind assets...')
  copyFolder(inAssets, outAssets)
}

const makeDir = curPath => new Promise((resolve, reject) => {
  fs.mkdir(curPath, {recursive: true}, err => { if(err) reject(err.message) })
  resolve()
})

const rmDir = curPath => new Promise(resolve => {
  fs.rm(curPath, {recursive: true, force: true}, () => resolve())
})

const getFileList = (fromPath, copyPath) => new Promise((resolve, reject) => {
  fs.readdir(fromPath, {withFileTypes: true}, (err, files) => {
    if(err) return reject(err.message)
    files.forEach(dir => {
      if(dir.isDirectory()) copyFolder(path.join(fromPath, dir.name), path.join(copyPath, dir.name))
    })
    let fileLists = files
      .filter(file => file.isFile())
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
    .then(() => getFileList(filesPath, copyPath))
    .then(fileLists => 
      fileLists.forEach(file => {
        copyFile(path.join(filesPath, file), copyPath)
      }))
    .catch(err => console.error(err))
}

async function buildCss(stylesPath, bundlePath) {
  console.log('Building CSS...')
  const files = await getCssFiles(stylesPath)
  packAllToBundle(bundlePath, files)
}

const getCssFiles = async (dir) => new Promise((resolve, reject) => {
  fs.readdir(dir, {withFileTypes: true}, (err, files) => {
    if(err) return reject(err)
    resolve (
      files
        .filter(file => file.isFile())
        .filter(file => path.extname(file.name) == '.css')
        .map(file => path.join(dir, file.name))
    )
  })
});

const packAllToBundle = async (bundleFile, files) => {
  const wStream = fs.createWriteStream(bundleFile)
  files.forEach(file => writeFile(file, wStream))
}

const writeFile = async (file, wStream) => {
  const rStream = fs.createReadStream(file)
  rStream.pipe(wStream)
}

const linesArr = []
let compCounter = 0

async function buildHTML(inFile, outFile) {
  console.log('Creating HTML...')
  const componentsDir = path.join(path.dirname(inFile), 'components')
  const wStream = fs.createWriteStream(outFile, {encoding: 'utf-8'});
  const rl = readline.createInterface({
    input: fs.createReadStream(inFile, {encoding: 'utf-8'}),
    crlfDelay: Infinity
  });

  rl.on('line', input => {
    if(input.search('{{') > 0 && input.search('}}') > input.search('{{')) {
      const _arr = input.split('{')
      const _before = _arr[0] //spaces before block
        .split('')
        .filter(ch => ch == ' ')
        .join('')
      const _componentNames = _arr
        .filter((it, i, arr) => arr[i - 1] == '')
        .map(it => it.split('}')[0])
      _componentNames.forEach(comp => linesArr.push(`${_before}{{${comp}}}`))
    } else {
      linesArr.push(input)
    }
  })
  rl.on('close', () => fillArr(componentsDir, wStream))
}

const fillArr = (componentsDir, wStream) => {
  linesArr.forEach((input, i) => {
    if(input.search('{{') > 0 && input.search('}}') > input.search('{{')) {
      compCounter++
      const _arr = input.split('{')
      const _before = _arr[0] //spaces before block
        .split('')
        .filter(ch => ch == ' ')
        .join('')
      const _componentName = _arr[2].split('}')[0]
      const componentPath = path.join(componentsDir, _componentName+'.html')
      addComponent(componentPath, _before)
        .then(it => linesArr[i] = it)
        .then(it => {
          if(compCounter == 0) linesArr.flat().forEach(it => wStream.write(it+'\n'))
        })
    }
  });
}

const addComponent = (componentPath, before) => new Promise((res, rej) => {
  const outComponent = []
  const rl = readline.createInterface({
    input: fs.createReadStream(componentPath, {encoding: 'utf-8'}),
    crlfDelay: Infinity
  })
  rl.on('line', input => {
    outComponent.push(before + input)
  })
  rl.on('close', () => {
    compCounter--;
    res(outComponent)
  })
  rl.on('error', err => rej(err))
})

async function buildProject() {
  createDir('project-dist');
  buildHTML(inHtmlFile, outHtmlFile)
  buildCss(inCssFolder, outCssFile)
  copyAssets(inAssets, outAssets)
}

const createDir = (dir) => {
  const dirPath = path.join(__dirname, dir)
  fs.mkdir(dirPath, {recursive: true}, (err) => {if(err) throw err})
}

buildProject()