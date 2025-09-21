const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateJWT } = require('../middleware/authMiddleware');

const COLLEGE_API_URL = process.env.COLLEGE_API_URL;

// Middleware to handle errors from the external API
const handleApiError = (err, res) => {
    console.error('College API error:', err.response ? err.response.data : err.message);
    const status = err.response ? err.response.status : 500;
    const message = err.response ? err.response.data.message : 'Failed to fetch data from College API';
    res.status(status).json({ message });
};

/**
 * @route   GET /api/colleges
 * @desc    List all colleges or filter by district/program
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { district, program } = req.query;
        const response = await axios.get(`${COLLEGE_API_URL}/api/colleges`, {
            params: { district, program }
        });
        res.json(response.data);
    } catch (err) {
        handleApiError(err, res);
    }
});

/**
 * @route   GET /api/colleges/suggest
 * @desc    Get personalized college suggestions
 * @access  Authenticated
 */
router.get('/suggest', authenticateJWT, async (req, res) => {
    try {
        // The new API uses 'qualification' and 'specialization' directly
        const { qualification, specialization } = req.query;
        if (!qualification) {
            return res.status(400).json({ message: 'Qualification is required' });
        }

        const response = await axios.get(`${COLLEGE_API_URL}/api/colleges/suggest`, {
            params: { qualification, specialization }
        });
        res.json(response.data);
    } catch (err) {
        handleApiError(err, res);
    }
});

module.exports = router;