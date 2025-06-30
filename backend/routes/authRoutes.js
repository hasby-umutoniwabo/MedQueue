// const express = require('express');
// const authController = require('../controllers/authController');
// const { validateSignup, validateLogin, validateForgotPassword, validateResetPassword, validateUpdatePassword } = require('../middleware/validation');

// const router = express.Router();

// // Public routes (no authentication required)
// router.post('/signup', validateSignup, authController.signup);
// router.post('/login', validateLogin, authController.login);
// router.post('/refresh-token', authController.refreshToken);
// router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
// router.patch('/reset-password/:token', validateResetPassword, authController.resetPassword);
// router.patch('/verify-email/:token', authController.verifyEmail);

// // Protected routes (authentication required)
// router.use(authController.protect); // All routes after this middleware are protected

// router.post('/logout', authController.logout);
// router.get('/me', authController.getMe);
// router.patch('/update-me', authController.updateMe);
// router.patch('/update-password', validateUpdatePassword, authController.updatePassword);
// router.delete('/delete-me', authController.deleteMe);

// module.exports = router;

const express = require('express');
const router = express.Router();

// Import the auth controller
const authController = require('../controllers/authController');

// Test route to verify the controller is loading
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

// Public routes (no authentication required)
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes would go here (after adding authentication middleware)
// router.use(authController.protect); // This line was causing the error
// router.get('/me', authController.getMe);
// router.post('/logout', authController.logout);

module.exports = router;