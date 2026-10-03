const https = require('https');

const data = JSON.stringify({ sanad_last_update: 0 });

const options = {
  hostname: 'api.npoint.io',
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('body:', body));
});

req.on('error', (e) => {
  console.error(e);
});

req.write(data);
req.end();
