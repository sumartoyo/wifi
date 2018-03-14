#!/usr/bin/nodejs

const fs = require('fs');
const ini = require('ini');
const { spawn } = require('./helper');

const IFACE = 'wlp2s0';

const showActive = (argv) => {
  if (argv.length === 0) {
    let isHeader = true;
    const onOut = data => {
      const lines = data.toString().split('\n');
      for (let i = 0; i < lines.length-1; i++) {
        if (isHeader) {
          isHeader = false;
        } else {
          const line = lines[i];
          if (line[0] === '*') {
            console.log(line);
            break;
          }
        }
      }
    }

    spawn('nmcli', ['dev', 'wifi'], { onOut });
    return true;
  }
}

const list = (argv) => {
  if (argv[0] === 'list') {
    spawn('nmcli', ['dev', 'wifi']);
    return true;
  }
}

const disconnect = (argv) => {
  if (argv[0] === 'disco') {
    spawn('nmcli', ['dev', 'disconnect', IFACE]);
    return true;
  }
}

const connect = (argv) => {
  if (argv[0] === 'conn') {
    if (argv.length < 2) {
      return false;
    }

    if (argv.length > 2) {
      if (argv.length !== 4) {
        return false;
      }
      if (argv[2] !== 'password') {
        return false;
      }
    }

    const ssid = argv[1];

    Promise.resolve()
      .then(_ => new Promise((resolve, reject) => {
        let uuid = null;
        let isHeader = true;
        let posUuid = null;
        let refSsid = null;

        spawn('nmcli', ['con', 'show'], {
          onOut: data => {
            const lines = data.toString().split('\n');
            for (let i = 0; i < lines.length-1; i++) {
              if (isHeader) {
                posUuid = lines[i].indexOf('UUID');
                refSsid = ssid;
                while (refSsid.length < posUuid) {
                  refSsid += ' ';
                }
                isHeader = false;
              } else {
                const line = lines[i];
                if (line.startsWith(refSsid)) {
                  uuid = line.slice(posUuid).split(' ').shift();
                  break;
                }
              }
            }
          },

          onClose: status => {
            if (status !== 0) {
              process.exit(status);
            } else {
              resolve(uuid);
            }
          },
        });
      }))
      .then(uuid => {
        let args;
        if (uuid) {
          args = ['con', 'up', 'uuid', uuid];
        } else {
          args = ['dev', 'wifi', 'connect', ssid];
        }
        spawn('nmcli', args);
      })

    return true;
  }
}

const main = () => {
  const argv = process.argv.slice(2);
  if (showActive(argv)) return;
  if (list(argv)) return;
  if (disconnect(argv)) return;
  if (connect(argv)) return;

  console.log(`Usage:`);
  console.log(`  wifi`);
  console.log(`  wifi list`);
  console.log(`  wifi disco`);
  console.log(`  wifi conn <ssid>`);
  process.exit(1);
}

main();
