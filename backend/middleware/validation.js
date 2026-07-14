const { body, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

const authValidators = {
  signup: [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  login: [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required')
  ]
};

const productValidators = {
  createOrUpdate: [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('category').notEmpty().withMessage('Category is required')
  ]
};

const cartValidators = {
  addOrUpdate: [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ]
};

const orderValidators = {
  process: [
    body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status')
  ]
};

module.exports = {
  validate,
  authValidators,
  productValidators,
  cartValidators,
  orderValidators
};
