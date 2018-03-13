const child_process = require('child_process');

const printData = (data) => {
  const lines = data.toString().split('\n');
  for (let i = 0; i < lines.length-1; i++) {
    console.log(lines[i]);
  }
}

const spawn = (command, args, listeners={}) => {
  const proc = child_process.spawn(command, args);
  proc.on('close', listeners.onClose || process.exit);
  proc.stderr.on('data', listeners.onErr || printData);
  proc.stdout.on('data', listeners.onOut || printData);
}

module.exports = {
  printData,
  spawn,
};
