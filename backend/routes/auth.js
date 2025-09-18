const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { geminiGenerateQuiz, geminiCareerSuggestion } = require('../ai/gemini');

// Gemini: Generate quiz dynamically
router.get('/quiz', authenticateJWT, async (req, res) => {
	const qualification = req.user.qualification || req.query.qualification;
	if (!qualification) {
		return res.status(400).json({ message: 'Missing qualification (10 or 12)' });
	}
	const quiz = await geminiGenerateQuiz(qualification);
	if (!quiz) return res.status(500).json({ message: 'Failed to generate quiz' });
	res.json({ quiz });
});

// Gemini: Submit quiz and get AI suggestion
router.post('/quiz/submit', authenticateJWT, async (req, res) => {
	const { answers } = req.body;
	const qualification = req.user.qualification;
	if (!answers || !Array.isArray(answers)) {
		return res.status(400).json({ message: 'Answers array required' });
	}
	const suggestion = await geminiCareerSuggestion(qualification, answers);
	if (!suggestion) return res.status(500).json({ message: 'Failed to get suggestion' });
	res.json({ suggestion });
});



// Logout endpoint
router.post('/logout', authenticateJWT, authController.logout);
// Registration
router.post('/register', authController.register);
// Login (send OTP)
router.post('/login', authController.login);
// Verify OTP
router.post('/verify-otp', authController.verifyOtp);
// Protected dashboard
router.get('/dashboard', authenticateJWT, authController.dashboard);
// Admin delete user by email
router.delete('/admin/delete-user', authController.adminDeleteUser);

// Update user profile
router.put('/profile', authenticateJWT, authController.updateProfile);
// Get personalized recommendations
router.get('/recommendations', authenticateJWT, authController.getRecommendations);

module.exports = router;
