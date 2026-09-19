const { body, param, query, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
}

const validatePointRule = [
  body('label').trim().notEmpty().withMessage('Label is required'),
  body('points').isInt({ min: 0, max: 1000 }).withMessage('Points must be between 0 and 1000'),
  body('description').optional().trim().isLength({ max: 500 }),
  handleValidationErrors
];

const validateAdjustment = [
  body('adjustment').isInt({ min: -1000, max: 1000 }).withMessage('Adjustment must be between -1000 and 1000'),
  body('reason').trim().notEmpty().withMessage('Reason is required').isLength({ max: 500 }),
  handleValidationErrors
];

const validateResync = [
  body('prNumber').isInt({ min: 1 }).withMessage('Valid PR number is required'),
  handleValidationErrors
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim().isLength({ max: 100 }),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validatePointRule,
  validateAdjustment,
  validateResync,
  validatePagination
};
