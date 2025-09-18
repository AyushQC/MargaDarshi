const express = require('express');
const axios = require('axios');
const { authenticateJWT } = require('../middleware/authMiddleware');
const router = express.Router();

const BASE_URL = 'http://3.35.197.61:5000/colleges';
const ALLOWED_DISTRICTS = ['Kalaburagi', 'Koppal'];

// A mapping from common aliases to the official program names in the database
const PROGRAM_ALIASES = {
    'puc': 'PUC Commerce',
    'commerce': 'PUC Commerce',
    'science': 'PUC Science',
    'arts': 'PUC Arts',
    'iti': 'ITI',
    'diploma': 'Diploma'
};

// GET /colleges?district=Kalaburagi&program=...
router.get('/', authenticateJWT, async (req, res) => {
  try {
    let { district, program } = req.query;

    if (district && !ALLOWED_DISTRICTS.includes(district)) {
      return res.status(400).json({ message: 'Only Kalaburagi and Koppal are supported.' });
    }

    // Construct the URL to fetch colleges, but only by district for now.
    let url = BASE_URL;
    if (district) {
      url += `?district=${encodeURIComponent(district)}`;
    }

    const response = await axios.get(url);
    let colleges = response.data;

    // If a program is specified, filter the results on the backend.
    if (program && colleges.length > 0) {
      const searchTerm = program.toLowerCase().trim();
      
      // Check if the search term is an alias, otherwise use the term directly.
      const officialProgram = PROGRAM_ALIASES[searchTerm] || searchTerm;

      // Create a case-insensitive regular expression for matching.
      const regex = new RegExp(officialProgram, 'i');

      colleges = colleges.filter(college => 
        college.programs && college.programs.some(p => regex.test(p))
      );
    }

    res.json(colleges);
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