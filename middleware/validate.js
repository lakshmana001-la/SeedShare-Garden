// middleware/validate.js
// Validation middleware for POST and PUT requests on plots, gardeners, and leases.
// Each function checks the request body and returns errors if input is invalid.

// Valid soil types allowed in the system
const VALID_SOIL_TYPES = ['Clay', 'Loam', 'Sandy', 'Silt', 'Peat', 'Chalk'];

// Valid sunlight options
const VALID_SUNLIGHT = ['Full Sun', 'Partial Shade', 'Full Shade'];

// Valid membership types
const VALID_MEMBERSHIPS = ['standard', 'premium', 'volunteer'];

// ─────────────────────────────────────────────────────────
// PLOT VALIDATION
// ─────────────────────────────────────────────────────────

/**
 * Validates data for creating a new plot (POST /plots).
 * Checks required fields, soil type, and format.
 */
function validatePlotCreate(req, res, next) {
  const errors = [];
  const { plot_name, soil_type, size_sqm } = req.body;

  // Check required fields exist and are not empty strings
  if (!plot_name || String(plot_name).trim() === '') {
    errors.push('plot_name is required and cannot be empty.');
  }

  if (!soil_type || String(soil_type).trim() === '') {
    errors.push('soil_type is required and cannot be empty.');
  } else if (!VALID_SOIL_TYPES.includes(soil_type)) {
    // Check soil type is one of the allowed values
    errors.push(`soil_type must be one of: ${VALID_SOIL_TYPES.join(', ')}.`);
  }

  if (size_sqm === undefined || size_sqm === null || size_sqm === '') {
    errors.push('size_sqm is required and cannot be empty.');
  } else if (isNaN(Number(size_sqm)) || Number(size_sqm) <= 0) {
    errors.push('size_sqm must be a positive number.');
  }

  // Validate plot_name format: letters, numbers, spaces, hyphens only
  if (plot_name && !/^[A-Za-z0-9 \-]+$/.test(String(plot_name).trim())) {
    errors.push('plot_name may only contain letters, numbers, spaces, and hyphens.');
  }

  // If there are any errors, return 400 Bad Request with error messages
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please fix the following errors:',
      errors,
    });
  }

  next(); // No errors — continue to the route handler
}

/**
 * Validates data for updating a plot (PUT /plots/:id).
 * Both plot_name and soil_type are required for update.
 */
function validatePlotUpdate(req, res, next) {
  const errors = [];
  const { plot_name, soil_type } = req.body;

  if (!plot_name || String(plot_name).trim() === '') {
    errors.push('plot_name is required and cannot be empty.');
  } else if (!/^[A-Za-z0-9 \-]+$/.test(String(plot_name).trim())) {
    errors.push('plot_name may only contain letters, numbers, spaces, and hyphens.');
  }

  if (!soil_type || String(soil_type).trim() === '') {
    errors.push('soil_type is required and cannot be empty.');
  } else if (!VALID_SOIL_TYPES.includes(soil_type)) {
    errors.push(`soil_type must be one of: ${VALID_SOIL_TYPES.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please fix the following errors:',
      errors,
    });
  }

  next();
}

// ─────────────────────────────────────────────────────────
// GARDENER VALIDATION
// ─────────────────────────────────────────────────────────

/**
 * Validates data for creating a new gardener (POST /gardeners).
 */
function validateGardenerCreate(req, res, next) {
  const errors = [];
  const { first_name, last_name, email, membership_type } = req.body;

  if (!first_name || String(first_name).trim() === '') {
    errors.push('first_name is required and cannot be empty.');
  }

  if (!last_name || String(last_name).trim() === '') {
    errors.push('last_name is required and cannot be empty.');
  }

  if (!email || String(email).trim() === '') {
    errors.push('email is required and cannot be empty.');
  } else {
    // Simple email format check using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('email must be a valid email address (e.g. name@example.com).');
    }
  }

  if (membership_type && !VALID_MEMBERSHIPS.includes(membership_type)) {
    errors.push(`membership_type must be one of: ${VALID_MEMBERSHIPS.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please fix the following errors:',
      errors,
    });
  }

  next();
}

// ─────────────────────────────────────────────────────────
// LEASE VALIDATION
// ─────────────────────────────────────────────────────────

/**
 * Validates data for creating a new lease (POST /leases).
 */
function validateLeaseCreate(req, res, next) {
  const errors = [];
  const { gardener_id, plot_id, start_date } = req.body;

  if (!gardener_id || isNaN(Number(gardener_id))) {
    errors.push('gardener_id is required and must be a valid number.');
  }

  if (!plot_id || isNaN(Number(plot_id))) {
    errors.push('plot_id is required and must be a valid number.');
  }

  if (!start_date || String(start_date).trim() === '') {
    errors.push('start_date is required (format: YYYY-MM-DD).');
  } else {
    // Check date format is YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start_date)) {
      errors.push('start_date must be in YYYY-MM-DD format (e.g. 2024-06-01).');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please fix the following errors:',
      errors,
    });
  }

  next();
}

// Export all validation middleware functions
module.exports = {
  validatePlotCreate,
  validatePlotUpdate,
  validateGardenerCreate,
  validateLeaseCreate,
};
