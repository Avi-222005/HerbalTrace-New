const tls = require('tls');
const fs = require('fs');
const path = require('path');

const ports = [
  { name: 'orderer', port: 7050, cert: '../network/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem', host: 'orderer.herbaltrace.com' },
  { name: 'peer0-farmers', port: 7051, cert: '../network/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt', host: 'peer0.farmers.herbaltrace.com' },
  { name: 'peer0-labs', port: 9051, cert: '../network/organizations/peerOrganizations/labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt', host: 'peer0.labs.herbaltrace.com' },
  { name: 'peer0-processors', port: 11051, cert: '../network/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt', host: 'peer0.processors.herbaltrace.com' },
  { name: 'peer0-manufacturers', port: 13051, cert: '../network/organizations/peerOrganizations/manufacturers.herbaltrace.com/peers/peer0.manufacturers.herbaltrace.com/tls/ca.crt', host: 'peer0.manufacturers.herbaltrace.com' },
];

async function checkPort(item) {
  return new Promise((resolve) => {
    const certPath = path.resolve(__dirname, item.cert);
    if (!fs.existsSync(certPath)) {
      return resolve({ name: item.name, status: 'CERT_NOT_FOUND', path: certPath });
    }
    const ca = fs.readFileSync(certPath);
    const socket = tls.connect({
      host: '127.0.0.1',
      port: item.port,
      ca: ca,
      servername: item.host,
      rejectUnauthorized: false
    }, () => {
      const authorized = socket.authorized;
      const authError = socket.authorizationError;
      socket.end();
      resolve({ name: item.name, status: 'CONNECTED', authorized, authError });
    });

    socket.on('error', (err) => {
      resolve({ name: item.name, status: 'ERROR', message: err.message });
    });
    socket.setTimeout(3000, () => {
      socket.destroy();
      resolve({ name: item.name, status: 'TIMEOUT' });
    });
  });
}

(async () => {
  for (const p of ports) {
    const res = await checkPort(p);
    console.log(res);
  }
})();
