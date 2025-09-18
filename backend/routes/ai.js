const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// --- AI-DRIVEN CAREER GUIDANCE FLOW ---

// 1. Get a personalized quiz
router.get('/quiz', authenticateJWT, authController.getQuiz);

// 2. Submit quiz answers and get back a list of career titles
router.post('/quiz/submit', authenticateJWT, authController.submitQuiz);

// 3. Get detailed information for a specific career title
router.post('/career/details', authenticateJWT, authController.getCareerDetails);

module.exports = router;
