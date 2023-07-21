/** @format */

// your-remixjs-project/api/proxy.js

const http = require('http');

// Replace 'http://103.175.216.182:4000' with the actual URL of your HTTP API
const targetURL = 'http://103.175.216.182:4000';

export default function handler(req, res) {
  const proxyReq = http.request(targetURL + req.url, {
    method: req.method,
    headers: req.headers,
  });

  req.pipe(proxyReq);

  proxyReq.on('response', (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Error occurred during proxying:', err);
    res.statusCode = 500;
    res.end('Server Error');
  });
}
