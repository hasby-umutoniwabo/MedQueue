const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    
    return next(new AppError('Validation failed', 400, errorMessages));
  }
  
  next();
};

// Signup validation
const validateSignup = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
    
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('phone')
    .trim()
    .matches(/^(\+250|0)[0-9]{9}$/)
    .withMessage('Please provide a valid Rwandan phone number'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
  body('role')
    .optional()
    .isIn(['patient', 'staff', 'admin'])
    .withMessage('Role must be either patient, staff, or admin'),
    
  body('clinic')
    .if(body('role').equals('staff'))
    .notEmpty()
    .withMessage('Clinic is required for staff users')
    .isMongoId()
    .withMessage('Invalid clinic ID'),
    
  body('language')
    .optional()
    .isIn(['en', 'rw', 'fr'])
    .withMessage('Language must be en, rw, or fr'),
    
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  body('role')
    .optional()
    .isIn(['patient', 'staff', 'admin'])
    .withMessage('Invalid role'),
    
  handleValidationErrors
];

// Forgot password validation
const validateForgotPassword = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  handleValidationErrors
];

// Reset password validation
const validateResetPassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
  body('passwordConfirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
    
  handleValidationErrors
];

// Update password validation
const validateUpdatePassword = [
  body('passwordCurrent')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
  body('passwordConfirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
    
  handleValidationErrors
];

// Update profile validation
const validateUpdateProfile = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
    
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+250|0)[0-9]{9}$/)
    .withMessage('Please provide a valid Rwandan phone number'),
    
  body('language')
    .optional()
    .isIn(['en', 'rw', 'fr'])
    .withMessage('Language must be en, rw, or fr'),
    
  handleValidationErrors
];

module.exports = {
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdatePassword,
  validateUpdateProfile,
  handleValidationErrors
};