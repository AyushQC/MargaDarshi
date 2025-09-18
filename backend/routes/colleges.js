const express = require('express');
const axios = require('axios');
const { authenticateJWT } = require('../middleware/authMiddleware');
const router = express.Router();

const BASE_URL = 'http://3.35.197.61:5000/colleges';
const ALLOWED_DISTRICTS = ['Kalaburagi', 'Koppal'];

// Function to escape special characters for use in a regular expression.
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// GET /colleges?district=...&program=...
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { district, program } = req.query;

    if (district && !ALLOWED_DISTRICTS.includes(district)) {
      return res.status(400).json({ message: 'Only Kalaburagi and Koppal are supported.' });
    }

    // Always fetch all colleges for the given district first.
    // If no district is provided, the external API will return all colleges.
    const params = {};
    if (district) {
      params.district = district;
    }

    const response = await axios.get(BASE_URL, { params });
    let colleges = response.data;

    // If a program is specified, filter the results on our backend.
    if (program && colleges && colleges.length > 0) {
      // Escape the search term to handle special characters like '&' safely.
      const escapedTerm = escapeRegex(program);
      
      // Create a case-insensitive regular expression.
      const regex = new RegExp(escapedTerm, 'i');

      // Filter colleges based on the program name.
      // This now correctly checks the 'name' property inside the 'programs' array objects.
      colleges = colleges.filter(college => 
        Array.isArray(college.programs) && 
        college.programs.some(p => p && p.name && regex.test(p.name))
      );
    }

    res.json(colleges);

  } catch (err) {
    console.error('Error fetching or filtering colleges:', err.message);
    res.status(500).json({ message: 'Failed to fetch colleges', error: err.message });
  }
});

// GET /colleges/:collegeId (No changes needed here)
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