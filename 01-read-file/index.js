const fs = require('fs');
const path = require('path');
const { stdout } = require('process');

const readStream = fs.createReadStream(path.join(__dirname, 'text.txt'), {encoding: 'utf-8'})
const chunks = []

readStream.on('error', err => console.error(`Error: ${err}`))
readStream.on('data', chunk => chunks.push(chunk))
readStream.on('end', () => stdout.write(chunks.join('')+'\n'))