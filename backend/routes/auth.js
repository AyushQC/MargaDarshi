const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// --- NEW TWO-STEP AI FLOW ---

// 1. Get a personalized quiz
router.get('/quiz', authenticateJWT, authController.getQuiz);

// 2. Submit quiz answers and get back a list of career titles
router.post('/quiz/submit', authenticateJWT, authController.submitQuiz);

// 3. Get detailed information for a specific career title
router.post('/career/details', authenticateJWT, authController.getCareerDetails);


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
