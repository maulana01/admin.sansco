/** @format */

const { createProxyMiddleware } = require('http-proxy-middleware');

// Replace 'http://103.175.216.182:4000' with the actual URL of your HTTP API
const apiProxy = createProxyMiddleware({
  target: 'http://103.175.216.182:4000',
  changeOrigin: true,
});

export default function handler(req, res) {
  // Set the req.url to the correct endpoint URL
  req.url = `/api/${req.url.split('/api/')[1]}`;
  // This will proxy any incoming request to the HTTP API
  apiProxy(req, res);
}
