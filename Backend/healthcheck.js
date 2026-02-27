#!/usr/bin/env node

/**
 * Docker healthcheck script for the APTP backend.
 * Exits 0 if the /api/health endpoint responds OK, 1 otherwise.
 */

const http = require('http');

const PORT = process.env.PORT || 5000;

const options = {
  hostname: 'localhost',
  port: PORT,
  path: '/api/health',
  method: 'GET',
  timeout: 3000,
};

const req = http.request(options, (res) => {
  process.exit(res.statusCode === 200 ? 0 : 1);
});

req.on('error', () => process.exit(1));
req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.end();
