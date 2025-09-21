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
        console.log('College API URL:', COLLEGE_API_URL);
        console.log('Request params:', req.query);
        
        if (!COLLEGE_API_URL) {
            return res.status(500).json({ 
                message: 'College API URL not configured. Please check environment variables.' 
            });
        }

        const { district, program } = req.query;
        const fullUrl = `${COLLEGE_API_URL}/api/colleges`;
        console.log('Making request to:', fullUrl, 'with params:', { district, program });
        
        const response = await axios.get(fullUrl, {
            params: { district, program },
            timeout: 10000 // 10 second timeout
        });
        
        console.log('College API response status:', response.status);
        res.json(response.data);
    } catch (err) {
        console.error('Detailed error:', {
            message: err.message,
            code: err.code,
            response: err.response ? {
                status: err.response.status,
                data: err.response.data
            } : 'No response'
        });
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
        console.log('College API URL:', COLLEGE_API_URL);
        console.log('Suggest request params:', req.query);
        
        if (!COLLEGE_API_URL) {
            return res.status(500).json({ 
                message: 'College API URL not configured. Please check environment variables.' 
            });
        }

        // The new API uses 'qualification' and 'specialization' directly
        const { qualification, specialization } = req.query;
        if (!qualification) {
            return res.status(400).json({ message: 'Qualification is required' });
        }

        const fullUrl = `${COLLEGE_API_URL}/api/colleges/suggest`;
        console.log('Making suggest request to:', fullUrl, 'with params:', { qualification, specialization });

        const response = await axios.get(fullUrl, {
            params: { qualification, specialization },
            timeout: 10000 // 10 second timeout
        });
        
        console.log('College API suggest response status:', response.status);
        res.json(response.data);
    } catch (err) {
        console.error('Detailed suggest error:', {
            message: err.message,
            code: err.code,
            response: err.response ? {
                status: err.response.status,
                data: err.response.data
            } : 'No response'
        });
        handleApiError(err, res);
    }
});

module.exports = router;