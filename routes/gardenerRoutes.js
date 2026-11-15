// routes/gardenerRoutes.js
// Defines URL routes for the /gardeners API endpoints.

const express = require('express');
const router = express.Router();

const {
  getAllGardeners,
  getGardenerById,
  createGardener,
  updateGardener,
  deleteGardener,
} = require('../controllers/gardenerController');

const { validateGardenerCreate } = require('../middleware/validate');

// GET  /gardeners       → Get all active gardeners
router.get('/', getAllGardeners);

// GET  /gardeners/:id   → Get one gardener by ID
router.get('/:id', getGardenerById);

// POST /gardeners       → Create a new gardener (with validation)
router.post('/', validateGardenerCreate, createGardener);

// PUT  /gardeners/:id   → Update a gardener's details
router.put('/:id', updateGardener);

// DELETE /gardeners/:id → Deactivate a gardener (soft delete)
router.delete('/:id', deleteGardener);

module.exports = router;
