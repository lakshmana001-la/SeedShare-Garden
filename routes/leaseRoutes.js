// routes/leaseRoutes.js
// Defines URL routes for the /leases API endpoints.

const express = require('express');
const router = express.Router();

const {
  getAllLeases,
  getLeaseById,
  createLease,
  updateLease,
  deleteLease,
  getGardenerPlotJoin,
} = require('../controllers/leaseController');

const { validateLeaseCreate } = require('../middleware/validate');

// GET  /leases/join     → Join endpoint: gardener + plot info (must be BEFORE /:id)
router.get('/join', getGardenerPlotJoin);

// GET  /leases          → Get all leases
router.get('/', getAllLeases);

// GET  /leases/:id      → Get one lease
router.get('/:id', getLeaseById);

// POST /leases          → Create a new lease (with validation)
router.post('/', validateLeaseCreate, createLease);

// PUT  /leases/:id      → Update a lease
router.put('/:id', updateLease);

// DELETE /leases/:id    → Terminate a lease
router.delete('/:id', deleteLease);

module.exports = router;
