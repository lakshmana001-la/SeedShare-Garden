// controllers/gardenerController.js
// Handles all logic for the /gardeners API endpoints.

const db = require('../database');

// ─────────────────────────────────────────────────────────
// GET /gardeners  — Get all active gardeners
// ─────────────────────────────────────────────────────────
function getAllGardeners(req, res) {
  try {
    const gardeners = db.prepare(`
      SELECT * FROM gardeners
      WHERE is_active = 1
      ORDER BY id ASC
    `).all();

    return res.status(200).json({
      success: true,
      count: gardeners.length,
      data: gardeners,
    });
  } catch (error) {
    console.error('Error in getAllGardeners:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving gardeners.',
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────
// GET /gardeners/:id  — Get a single gardener
// ─────────────────────────────────────────────────────────
function getGardenerById(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID "${id}". Gardener ID must be a number.`,
      });
    }

    const gardener = db.prepare('SELECT * FROM gardeners WHERE id = ?').get(Number(id));

    if (!gardener) {
      return res.status(404).json({
        success: false,
        message: `Gardener with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: gardener,
    });
  } catch (error) {
    console.error('Error in getGardenerById:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving the gardener.',
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────
// POST /gardeners  — Create a new gardener
// ─────────────────────────────────────────────────────────
function createGardener(req, res) {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      postcode,
      experience_years,
      membership_type,
      joined_date,
    } = req.body;

    // Check if email is already registered (must be unique)
    const existing = db.prepare('SELECT id FROM gardeners WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A gardener with email "${email}" already exists.`,
      });
    }

    const result = db.prepare(`
      INSERT INTO gardeners (first_name, last_name, email, phone, address, city, postcode, experience_years, membership_type, joined_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      first_name.trim(),
      last_name.trim(),
      email.trim().toLowerCase(),
      phone           || null,
      address         || null,
      city            || null,
      postcode        || null,
      experience_years !== undefined ? Number(experience_years) : 0,
      membership_type || 'standard',
      joined_date     || new Date().toISOString().split('T')[0]
    );

    const newGardener = db.prepare('SELECT * FROM gardeners WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Gardener created successfully.',
      data: newGardener,
    });
  } catch (error) {
    console.error('Error in createGardener:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating the gardener.',
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────
// PUT /gardeners/:id  — Update a gardener's details
// ─────────────────────────────────────────────────────────
function updateGardener(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({ success: false, message: `Invalid ID "${id}".` });
    }

    const existing = db.prepare('SELECT * FROM gardeners WHERE id = ?').get(Number(id));
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Gardener with ID ${id} not found.`,
      });
    }

    const {
      first_name   = existing.first_name,
      last_name    = existing.last_name,
      phone        = existing.phone,
      address      = existing.address,
      city         = existing.city,
      postcode     = existing.postcode,
      experience_years = existing.experience_years,
      membership_type  = existing.membership_type,
    } = req.body;

    db.prepare(`
      UPDATE gardeners
      SET first_name = ?, last_name = ?, phone = ?, address = ?, city = ?,
          postcode = ?, experience_years = ?, membership_type = ?
      WHERE id = ?
    `).run(first_name, last_name, phone, address, city, postcode, experience_years, membership_type, Number(id));

    const updated = db.prepare('SELECT * FROM gardeners WHERE id = ?').get(Number(id));

    return res.status(200).json({
      success: true,
      message: `Gardener with ID ${id} updated successfully.`,
      data: updated,
    });
  } catch (error) {
    console.error('Error in updateGardener:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating the gardener.',
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────
// DELETE /gardeners/:id  — Deactivate a gardener (soft delete)
// ─────────────────────────────────────────────────────────
function deleteGardener(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({ success: false, message: `Invalid ID "${id}".` });
    }

    const existing = db.prepare('SELECT * FROM gardeners WHERE id = ? AND is_active = 1').get(Number(id));
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Gardener with ID ${id} not found or is already inactive.`,
      });
    }

    // Set is_active to 0 instead of deleting
    db.prepare('UPDATE gardeners SET is_active = 0 WHERE id = ?').run(Number(id));

    return res.status(200).json({
      success: true,
      message: `Gardener "${existing.first_name} ${existing.last_name}" (ID: ${id}) has been deactivated.`,
    });
  } catch (error) {
    console.error('Error in deleteGardener:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while deactivating the gardener.',
      error: error.message,
    });
  }
}

module.exports = {
  getAllGardeners,
  getGardenerById,
  createGardener,
  updateGardener,
  deleteGardener,
};
