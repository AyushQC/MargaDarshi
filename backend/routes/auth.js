const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// --- USER AUTHENTICATION & MANAGEMENT ---

// Registration
router.post('/register', authController.register);

// Login (send OTP)
router.post('/login', authController.login);

// Verify OTP and get token
router.post('/verify-otp', authController.verifyOtp);

// Logout
router.post('/logout', authenticateJWT, authController.logout);

// Protected dashboard to get user info
router.get('/dashboard', authenticateJWT, authController.dashboard);

// Update user profile
router.put('/profile', authenticateJWT, authController.updateProfile);

// Profile photo endpoints
router.post('/upload-photo', authenticateJWT, authController.uploadPhoto);
router.get('/photo', authenticateJWT, authController.getPhoto);

// Admin: Delete a user
router.delete('/admin/delete-user', authController.adminDeleteUser);


module.exports = router;
