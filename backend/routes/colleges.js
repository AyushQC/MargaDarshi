const express = require('express');
const axios = require('axios');
const { authenticateJWT } = require('../middleware/authMiddleware');
const router = express.Router();

const BASE_URL = 'http://3.35.197.61:5000/colleges';
const ALLOWED_DISTRICTS = ['Kalaburagi', 'Koppal'];

// A mapping from common aliases to more specific search terms.
const PROGRAM_ALIASES = {
    'puc': 'PUC',
    'commerce': 'Commerce',
    'science': 'Science',
    'arts': 'Arts',
    'iti': 'ITI',
    'diploma': 'Diploma',
    'cs': 'Computer Science',
    'cse': 'Computer Science'
};

// Function to escape special characters for use in a regular expression.
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// GET /colleges?district=Kalaburagi&program=...
router.get('/', authenticateJWT, async (req, res) => {
  try {
    let { district, program } = req.query;

    if (district && !ALLOWED_DISTRICTS.includes(district)) {
      return res.status(400).json({ message: 'Only Kalaburagi and Koppal are supported.' });
    }

    // Always fetch colleges by district first.
    let url = BASE_URL;
    if (district) {
      url += `?district=${encodeURIComponent(district)}`;
    }

    const response = await axios.get(url);
    let colleges = response.data;

    // If a program search term is provided, filter the results.
    if (program && colleges && colleges.length > 0) {
      const searchTerm = program.toLowerCase().trim();
      
      // Check if the search term is an alias; if so, use the alias's value.
      // Otherwise, use the original search term.
      const effectiveSearchTerm = PROGRAM_ALIASES[searchTerm] || searchTerm;

      // Escape the search term to handle special characters like '&' safely.
      const escapedTerm = escapeRegex(effectiveSearchTerm);

      // Create a case-insensitive regular expression. This will find partial matches.
      // e.g., searching for "science" will match "PUC Science" and "Computer Science".
      const regex = new RegExp(escapedTerm, 'i');

      colleges = colleges.filter(college => 
        Array.isArray(college.programs) && college.programs.some(p => regex.test(p))
      );
    }

    res.json(colleges);
  } catch (err) {
    // Add more detailed logging on the backend for easier debugging.
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