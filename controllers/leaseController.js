// controllers/leaseController.js
// Handles all logic for the /leases API endpoints.

const db = require('../database');

// ─────────────────────────────────────────────────────────
// GET /leases  — Get all leases
// ─────────────────────────────────────────────────────────
function getAllLeases(req, res) {
  try {
    const leases = db.prepare(`
      SELECT
        l.*,
        g.first_name || ' ' || g.last_name AS gardener_name,
        p.plot_name
      FROM leases l
      JOIN gardeners g ON l.gardener_id = g.id
      JOIN plots p ON l.plot_id = p.id
      ORDER BY l.id ASC
    `).all();

    return res.status(200).json({
      success: true,
      count: leases.length,
      data: leases,
    });
  } catch (error) {
    console.error('Error in getAllLeases:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving leases.',
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────
// GET /leases/:id  — Get a single lease by ID
// ─────────────────────────────────────────────────────────
function getLeaseById(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID "${id}". Lease ID must be a number.`,
      });
    }

    const lease = db.prepare(`
      SELECT
        l.*,
        g.first_name || ' ' || g.last_name AS gardener_name,
        g.email AS gardener_email,
        p.plot_name,
        p.soil_type
      FROM leases l
      JOIN gardeners g ON l.gardener_id = g.id
      JOIN plots p ON l.plot_id = p.id
      WHERE l.id = ?
    `).get(Number(id));

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: `Lease with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: lease,
    });
  } catch (error) {
    console.error('Error in getLeaseById:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving the lease.',
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────
// POST /leases  — Create a new lease
// ─────────────────────────────────────────────────────────
function createLease(req, res) {
  try {
    const {
      gardener_id,
      plot_id,
      start_date,
      end_date,
      status,
      rent_paid,
      payment_method,
      agreement_signed,
      notes,
    } = req.body;

    // Verify the gardener exists and is active
    const gardener = db.prepare('SELECT * FROM gardeners WHERE id = ? AND is_active = 1').get(Number(gardener_id));
    if (!gardener) {
      return res.status(404).json({
        success: false,
        message: `Gardener with ID ${gardener_id} not found or is inactive.`,
      });
    }

    // Verify the plot exists and is not deleted
    const plot = db.prepare('SELECT * FROM plots WHERE id = ? AND deleted = 0').get(Number(plot_id));
    if (!plot) {
      return res.status(404).json({
        success: false,
        message: `Plot with ID ${plot_id} not found or has been deleted.`,
      });
    }

    // Check if this gardener already has an active lease on this plot
    const duplicate = db.prepare(`
      SELECT id FROM leases
      WHERE gardener_id = ? AND plot_id = ? AND status = 'active'
    `).get(Number(gardener_id), Number(plot_id));

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `This gardener already has an active lease on plot ID ${plot_id}.`,
      });
    }

    const result = db.prepare(`
      INSERT INTO leases (gardener_id, plot_id, start_date, end_date, status, rent_paid, payment_method, agreement_signed, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      Number(gardener_id),
      Number(plot_id),
      start_date,
      end_date        || null,
      status          || 'active',
      rent_paid !== undefined ? Number(rent_paid) : 0,
      payment_method  || 'cash',
      agreement_signed !== undefined ? Number(agreement_signed) : 0,
      notes           || null
    );

    const newLease = db.prepare(`
      SELECT l.*, g.first_name || ' ' || g.last_name AS gardener_name, p.plot_name
      FROM leases l
      JOIN gardeners g ON l.gardener_id = g.id
      JOIN plots p ON l.plot_id = p.id
      WHERE l.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Lease created successfully.',
      data: newLease,
    });
  } catch (error) {
    console.error('Error in createLease:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating the lease.',
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────
// PUT /leases/:id  — Update a lease (e.g., status, rent)
// ─────────────────────────────────────────────────────────
function updateLease(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({ success: false, message: `Invalid ID "${id}".` });
    }

    const existing = db.prepare('SELECT * FROM leases WHERE id = ?').get(Number(id));
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Lease with ID ${id} not found.`,
      });
    }

    const {
      end_date         = existing.end_date,
      status           = existing.status,
      rent_paid        = existing.rent_paid,
      payment_method   = existing.payment_method,
      agreement_signed = existing.agreement_signed,
      notes            = existing.notes,
    } = req.body;

    db.prepare(`
      UPDATE leases
      SET end_date = ?, status = ?, rent_paid = ?, payment_method = ?, agreement_signed = ?, notes = ?
      WHERE id = ?
    `).run(end_date, status, Number(rent_paid), payment_method, Number(agreement_signed), notes, Number(id));

    const updated = db.prepare(`
      SELECT l.*, g.first_name || ' ' || g.last_name AS gardener_name, p.plot_name
      FROM leases l
      JOIN gardeners g ON l.gardener_id = g.id
      JOIN plots p ON l.plot_id = p.id
      WHERE l.id = ?
    `).get(Number(id));

    return res.status(200).json({
      success: true,
      message: `Lease with ID ${id} updated successfully.`,
      data: updated,
    });
  } catch (error) {
    console.error('Error in updateLease:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating the lease.',
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────
// DELETE /leases/:id  — Terminate a lease (set status to terminated)
// ─────────────────────────────────────────────────────────
function deleteLease(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({ success: false, message: `Invalid ID "${id}".` });
    }

    const existing = db.prepare('SELECT * FROM leases WHERE id = ?').get(Number(id));
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Lease with ID ${id} not found.`,
      });
    }

    db.prepare(`UPDATE leases SET status = 'terminated' WHERE id = ?`).run(Number(id));

    return res.status(200).json({
      success: true,
      message: `Lease ID ${id} has been terminated.`,
    });
  } catch (error) {
    console.error('Error in deleteLease:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while terminating the lease.',
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────
// GET /leases/join  — Join endpoint: gardener name + plot name
// Uses SQL JOIN across all three tables
// ─────────────────────────────────────────────────────────
function getGardenerPlotJoin(req, res) {
  try {
    // This SQL JOIN query links all three tables together
    const results = db.prepare(`
      SELECT
        l.id            AS lease_id,
        g.first_name || ' ' || g.last_name AS gardener_name,
        g.email         AS gardener_email,
        p.plot_name,
        p.soil_type,
        p.location,
        l.start_date,
        l.end_date,
        l.status        AS lease_status,
        l.rent_paid
      FROM leases l
      JOIN gardeners g ON l.gardener_id = g.id
      JOIN plots p     ON l.plot_id = p.id
      WHERE p.deleted = 0
      ORDER BY l.id ASC
    `).all();

    return res.status(200).json({
      success: true,
      description: 'Gardener name and plot name joined across all three tables (leases → gardeners → plots)',
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Error in getGardenerPlotJoin:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while running the join query.',
      error: error.message,
    });
  }
}

module.exports = {
  getAllLeases,
  getLeaseById,
  createLease,
  updateLease,
  deleteLease,
  getGardenerPlotJoin,
};
