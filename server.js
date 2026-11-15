// server.js
// This is the main entry point for the SeedShare Garden backend API.
// It sets up the Express web server, registers routes, and starts listening for requests.

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// ─────────────────────────────────────────────────────────
// INITIALIZE DATABASE
// Running require('./database') creates the database file,
// creates tables, and seeds sample data if they don't exist yet.
// ─────────────────────────────────────────────────────────
require('./database');

// ─────────────────────────────────────────────────────────
// IMPORT ROUTES
// ─────────────────────────────────────────────────────────
const plotRoutes     = require('./routes/plotRoutes');
const gardenerRoutes = require('./routes/gardenerRoutes');
const leaseRoutes    = require('./routes/leaseRoutes');

// ─────────────────────────────────────────────────────────
// CREATE EXPRESS APP
// ─────────────────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────────────────
// MIDDLEWARE
// These run on every request before it reaches the routes.
// ─────────────────────────────────────────────────────────

// CORS allows requests from other origins (e.g. Postman, browsers)
app.use(cors());

// Parse JSON request bodies (so req.body works for POST/PUT requests)
app.use(express.json());

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Simple request logger — prints each incoming request to the console
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]  ${req.method}  ${req.originalUrl}`);
  next();
});

// ─────────────────────────────────────────────────────────
// ROUTES
// All API routes are prefixed with /api/
// ─────────────────────────────────────────────────────────
app.use('/api/plots',     plotRoutes);
app.use('/api/gardeners', gardenerRoutes);
app.use('/api/leases',    leaseRoutes);

// ─────────────────────────────────────────────────────────
// WELCOME ROUTE
// ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    message:  '🌱 Welcome to the SeedShare Garden API!',
    version:  '1.0.0',
    endpoints: {
      plots:     '/api/plots',
      gardeners: '/api/gardeners',
      leases:    '/api/leases',
      join:      '/api/leases/join',
    },
    docs: 'Import the Postman collection from the /postman folder to test all endpoints.',
  });
});

// ─────────────────────────────────────────────────────────
// 404 HANDLER
// Catches any request that did not match a defined route.
// ─────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route "${req.method} ${req.originalUrl}" not found.`,
    hint:    'Check the URL and HTTP method. Refer to the README for available endpoints.',
  });
});

// ─────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// Catches any unexpected errors that happen inside routes.
// ─────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred.',
    error:   err.message,
  });
});

// ─────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('🌱 ============================================');
  console.log('   SeedShare Garden API — Server Started');
  console.log('============================================');
  console.log(`   Server running at: http://localhost:${PORT}`);
  console.log('   Available endpoints:');
  console.log(`     GET  http://localhost:${PORT}/`);
  console.log(`     GET  http://localhost:${PORT}/api/plots`);
  console.log(`     GET  http://localhost:${PORT}/api/gardeners`);
  console.log(`     GET  http://localhost:${PORT}/api/leases`);
  console.log(`     GET  http://localhost:${PORT}/api/leases/join`);
  console.log('============================================');
  console.log('');
});

module.exports = app;
