// routes/plotRoutes.js
// Defines URL routes for the /plots API endpoints.
// Routes connect HTTP methods + URLs to the appropriate controller functions.

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getAllPlots,
  getPlotById,
  createPlot,
  updatePlot,
  deletePlot,
  restorePlot,
} = require('../controllers/plotController');

// Import validation middleware
const { validatePlotCreate, validatePlotUpdate } = require('../middleware/validate');

// ─────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────

// GET  /plots           → Get all active plots (also handles ?soil= search)
router.get('/', getAllPlots);

// GET  /plots/:id       → Get one plot by ID
router.get('/:id', getPlotById);

// POST /plots           → Create a new plot (with validation middleware)
router.post('/', validatePlotCreate, createPlot);

// PUT  /plots/:id       → Update a plot's name and soil type (with validation)
router.put('/:id', validatePlotUpdate, updatePlot);

// DELETE /plots/:id     → Soft-delete a plot (sets deleted = 1, NOT permanent)
router.delete('/:id', deletePlot);

// POST /plots/:id/restore → Restore a soft-deleted plot (sets deleted = 0)
router.post('/:id/restore', restorePlot);

module.exports = router;
