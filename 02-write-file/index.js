const fs = require('fs');
const path = require('path');
const { stdin, stdout } = process;

let file = path.join(__dirname, 'text.txt');
const output = fs.createWriteStream(file);

stdout.write('Welcome message.\n')

output.write('');
stdout.write('file text.txt created / rewritten\n');

stdout.write('Enter any text and press enter (exit to end):\n');
stdin.on('data', updateFile);

function updateFile(data) {
  if (data.toString().trim() === 'exit') {
    process.exit();
  }
  output.write(data);
  stdout.write(`'${data.toString().trim()}' added to text.txt\n`);
}
process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  process.exit();
});

process.on('exit', () => stdout.write('Goodbye message.'));