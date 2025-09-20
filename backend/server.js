const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();


const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/colleges');
const aiRoutes = require('./routes/ai'); // Import the new AI routes

const app = express();

app.use(cors());
app.use(bodyParser.json());

const corsOptions = {
  origin: 'http://localhost:3000', // Or your deployed frontend URL
  optionsSuccessStatus: 200 ,

  origin: ' https://margadarshi-gfve.onrender.com', // Or your deployed frontend URL
  optionsSuccessStatus: 200 

 
};
app.use(cors(corsOptions));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api', aiRoutes); // Use the AI routes with the /api prefix

app.get('/', (req, res) => {
    res.send('API is running');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
