const tls = require('tls');
const fs = require('fs');
const path = require('path');

const peerCertPath = path.resolve(__dirname, '../network/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt');
const caPem = fs.readFileSync(peerCertPath, 'utf8');

const s = tls.connect({
  host: '127.0.0.1',
  port: 11051,
  ca: [caPem],
  servername: 'peer0.processors.herbaltrace.com',
  rejectUnauthorized: false
}, () => {
  console.log('Peer TLS connected');
  const peerCert = s.getPeerCertificate(true);
  console.log('Subject:', peerCert.subject);
  console.log('Issuer:', peerCert.issuer);
  console.log('Valid from:', peerCert.valid_from, 'to', peerCert.valid_to);
  console.log('Authorized:', s.authorized);
  console.log('Auth Error:', s.authorizationError);
  s.end();
});

s.on('error', (e) => console.error('TLS err:', e));
