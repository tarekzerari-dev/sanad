const https = require('https');

const data = JSON.stringify({ sanad_last_update: 0 });

const options = {
  hostname: 'api.jsonbin.io',
  path: '/v3/b',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Accept': 'application/json',
    'X-Bin-Private': 'false'
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
