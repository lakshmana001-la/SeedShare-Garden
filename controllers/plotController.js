// controllers/plotController.js
// This file contains all the logic for plot-related API endpoints.
// Each function handles one specific action (get all, get one, create, update, delete, restore, search).

const db = require('../database');

// ─────────────────────────────────────────────────────────
// GET /plots  — Get all active (non-deleted) plots
// Also handles: GET /plots?soil=Clay  — Search by soil type
// ─────────────────────────────────────────────────────────
function getAllPlots(req, res) {
  try {
    const { soil } = req.query; // Read the ?soil= query parameter if provided

    let plots;

    if (soil) {
      // Filter plots by soil type (case-insensitive search)
      plots = db.prepare(`
        SELECT * FROM plots
        WHERE deleted = 0
          AND LOWER(soil_type) = LOWER(?)
        ORDER BY id ASC
      `).all(soil);

      // If no plots found for that soil type, return a helpful message
      if (plots.length === 0) {
        return res.status(200).json({
          success: true,
          message: `No plots found with soil type "${soil}".`,
          count: 0,
          data: [],
        });
      }
    } else {
      // No filter — return all non-deleted plots
      plots = db.prepare(`
        SELECT * FROM plots
        WHERE deleted = 0
        ORDER BY id ASC
      `).all();
    }

    return res.status(200).json({
      success: true,
      count: plots.length,
      data: plots,
    });
  } catch (error) {
    // Log the error and return 500 Server Error
    console.error('Error in getAllPlots:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving plots.',
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────
// GET /plots/:id  — Get a single plot by ID
// Returns 404 if the plot is deleted or does not exist.
// ─────────────────────────────────────────────────────────
function getPlotById(req, res) {
  try {
    const { id } = req.params;

    // Validate the ID is a number
    if (isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID "${id}". Plot ID must be a number.`,
      });
    }

    // Look for a non-deleted plot with this ID
    const plot = db.prepare(`
      SELECT * FROM plots WHERE id = ? AND deleted = 0
    `).get(Number(id));

    if (!plot) {
      // Plot not found — could be deleted or never existed
      return res.status(404).json({
        success: false,
        message: `Plot with ID ${id} not found or has been deleted.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: plot,
    });
  } catch (error) {
    console.error('Error in getPlotById:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving the plot.',
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────
// POST /plots  — Create a new plot
// ─────────────────────────────────────────────────────────
function createPlot(req, res) {
  try {
    const {
      plot_name,
      soil_type,
      size_sqm,
      location,
      sunlight,
      water_source,
      monthly_rent,
      max_gardeners,
      notes,
    } = req.body;

    // Insert the new plot into the database
    const result = db.prepare(`
      INSERT INTO plots (plot_name, soil_type, size_sqm, location, sunlight, water_source, monthly_rent, max_gardeners, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      plot_name.trim(),
      soil_type,
      Number(size_sqm),
      location   || null,
      sunlight   || null,
      water_source || null,
      monthly_rent !== undefined ? Number(monthly_rent) : 0,
      max_gardeners !== undefined ? Number(max_gardeners) : 1,
      notes      || null
    );

    // Retrieve the newly created plot to return it in the response
    const newPlot = db.prepare('SELECT * FROM plots WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Plot created successfully.',
      data: newPlot,
    });
  } catch (error) {
    console.error('Error in createPlot:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating the plot.',
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────
// PUT /plots/:id  — Update a plot's name and soil type
// ─────────────────────────────────────────────────────────
function updatePlot(req, res) {
  try {
    const { id } = req.params;
    const { plot_name, soil_type } = req.body;

    if (isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID "${id}". Plot ID must be a number.`,
      });
    }

    // Check the plot exists and is not deleted
    const existing = db.prepare('SELECT * FROM plots WHERE id = ? AND deleted = 0').get(Number(id));
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Plot with ID ${id} not found or has been deleted.`,
      });
    }

    // Perform the update
    db.prepare(`
      UPDATE plots
      SET plot_name = ?, soil_type = ?
      WHERE id = ?
    `).run(plot_name.trim(), soil_type, Number(id));

    // Return the updated plot
    const updated = db.prepare('SELECT * FROM plots WHERE id = ?').get(Number(id));

    return res.status(200).json({
      success: true,
      message: `Plot with ID ${id} updated successfully.`,
      data: updated,
    });
  } catch (error) {
    console.error('Error in updatePlot:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating the plot.',
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────
// DELETE /plots/:id  — Soft-delete a plot (set deleted = 1)
// The plot is NOT permanently removed from the database.
// ─────────────────────────────────────────────────────────
function deletePlot(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID "${id}". Plot ID must be a number.`,
      });
    }

    // Check the plot exists and is not already deleted
    const existing = db.prepare('SELECT * FROM plots WHERE id = ? AND deleted = 0').get(Number(id));
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Plot with ID ${id} not found or is already deleted.`,
      });
    }

    // Soft delete: update the deleted flag to 1 (instead of removing the record)
    db.prepare('UPDATE plots SET deleted = 1 WHERE id = ?').run(Number(id));

    return res.status(200).json({
      success: true,
      message: `Plot "${existing.plot_name}" (ID: ${id}) has been soft-deleted. It can be restored.`,
    });
  } catch (error) {
    console.error('Error in deletePlot:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting the plot.',
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────
// POST /plots/:id/restore  — Restore a soft-deleted plot
// ─────────────────────────────────────────────────────────
function restorePlot(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID "${id}". Plot ID must be a number.`,
      });
    }

    // Check the plot exists and IS deleted (deleted = 1)
    const existing = db.prepare('SELECT * FROM plots WHERE id = ? AND deleted = 1').get(Number(id));
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `No deleted plot found with ID ${id}. It may already be active or may not exist.`,
      });
    }

    // Restore: set deleted back to 0
    db.prepare('UPDATE plots SET deleted = 0 WHERE id = ?').run(Number(id));

    // Return the restored plot
    const restored = db.prepare('SELECT * FROM plots WHERE id = ?').get(Number(id));

    return res.status(200).json({
      success: true,
      message: `Plot "${restored.plot_name}" (ID: ${id}) has been successfully restored.`,
      data: restored,
    });
  } catch (error) {
    console.error('Error in restorePlot:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while restoring the plot.',
      error: error.message,
    });
  }
}

// Export all controller functions
module.exports = {
  getAllPlots,
  getPlotById,
  createPlot,
  updatePlot,
  deletePlot,
  restorePlot,
};
