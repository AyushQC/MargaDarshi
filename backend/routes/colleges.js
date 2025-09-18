const express = require('express');
const axios = require('axios');
const { authenticateJWT } = require('../middleware/authMiddleware');
const router = express.Router();

const BASE_URL = 'http://3.35.197.61:5000/colleges';
const ALLOWED_DISTRICTS = ['Kalaburagi', 'Koppal'];

// GET /colleges?district=Kalaburagi&program=...
router.get('/', authenticateJWT, async (req, res) => {
  try {
    let { district, program } = req.query;
    if (district && !ALLOWED_DISTRICTS.includes(district)) {
      return res.status(400).json({ message: 'Only Kalaburagi and Koppal are supported.' });
    }
    let url = BASE_URL;
    const params = [];
    if (district) params.push(`district=${encodeURIComponent(district)}`);
    if (program) params.push(`program=${encodeURIComponent(program)}`);
    if (params.length) url += '?' + params.join('&');
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch colleges', error: err.message });
  }
});

// GET /colleges/:collegeId
router.get('/:collegeId', authenticateJWT, async (req, res) => {
  try {
    const { collegeId } = req.params;
    const url = `${BASE_URL}/${collegeId}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch college details', error: err.message });
  }
});

module.exports = router;
