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
    const file = `/etc/NetworkManager/system-connections/${ssid}`;
    const args = ['dev', 'wifi', 'connect'].concat(argv.slice(1));

    if (argv[2] !== 'password' && fs.existsSync(file)) {
      if (!process.env.SUDO_UID) {
        console.log('must sudo');
        process.exit(1);
      }

      const config = ini.parse(fs.readFileSync(file, 'utf-8'));
      let security, password;
      if (security = config['wifi-security']) {
        if (password = security['psk']) {
          args.push('password');
          args.push(password);
        }
      }
    }

    spawn('nmcli', args);
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
  console.log(`  wifi conn [<ssid> [password <password>]]`);
  process.exit(1);
}

main();
