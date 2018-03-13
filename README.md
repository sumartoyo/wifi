# Wifi

Linux's Network Manager's nmcli frontend to control wifi connections

## Install

- `git clone git@github.com:sumartoyo/wifi.git`
- `cd wifi`
- `npm install`
- Edit `IFACE` in `index.js` with your wifi interface

## Usage

- `wifi` show currently active connection
- `wifi list` show available connections
- `wifi disco` disconnect
- `wifi conn [<ssid> [password <password>]]` connect to AP
