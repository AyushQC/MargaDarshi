const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt =require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { geminiGenerateQuiz, getCareerTitles, getCareerDetails } = require('../ai/gemini');

// --- NEW AI-DRIVEN ENDPOINTS ---

// 1. Get Quiz
exports.getQuiz = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const quiz = await geminiGenerateQuiz(user.qualification);
        if (!quiz) {
            return res.status(503).json({ message: 'Failed to generate quiz. AI service may be unavailable.' });
        }
        res.json({ quiz });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 2. Submit Quiz and Get Career Titles
exports.submitQuiz = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const { answers } = req.body;
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: '"answers" field is required and must be an array.' });
        }

        // Save answers to user profile
        const user = await User.findByIdAndUpdate(userId, { academic_interests: answers }, { new: true });

        const careerTitles = await getCareerTitles(user.qualification, answers);
        if (!careerTitles) {
            return res.status(503).json({ message: 'Failed to get career suggestions. AI service may be unavailable.' });
        }
        res.json({ career_titles: careerTitles });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 3. Get Detailed Career Roadmap
exports.getCareerDetails = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { career_title } = req.body;
        if (!career_title) {
            return res.status(400).json({ message: '"career_title" is required.' });
        }

        const details = await getCareerDetails(career_title, user.qualification);
        if (!details) {
            return res.status(503).json({ message: 'Failed to get career details. AI service may be unavailable.' });
        }
        res.json({ career_details: details });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// --- EXISTING USER AND AUTHENTICATION LOGIC ---

// Admin delete user by email (simple static password auth)
exports.adminDeleteUser = async (req, res) => {
    const { email, adminPassword } = req.body;
    if (!email || !adminPassword) {
        return res.status(400).json({ message: 'Email and adminPassword required' });
    }
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: 'Invalid admin password' });
    }
    try {
        const user = await User.findOneAndDelete({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await Otp.deleteOne({ email });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const { age, gender, academic_interests, name, dob, qualification, specialization, state, district } = req.body;
        const update = {};
        if (age !== undefined) update.age = age;
        if (gender) update.gender = gender;
        if (academic_interests) update.academic_interests = academic_interests;
        if (name) update.name = name;
        if (dob) update.dob = dob;
        if (qualification) update.qualification = qualification;
        if (specialization) update.specialization = specialization;
        if (state) update.state = state;
        if (district) update.district = district;
        const user = await User.findByIdAndUpdate(userId, update, { new: true });
        res.json({ message: 'Profile updated', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Helper to generate 6-digit OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to send OTP via email
async function sendOtpEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}: ${otp}`);
    } catch (error) {
        console.error('Error sending OTP email:', error.message);
        throw new Error('Failed to send OTP email');
    }
}

exports.register = async (req, res) => {
    try {
        const { name, dob, qualification, specialization, state, district, email, age, gender, academic_interests } = req.body;
        if (!name || !dob || !qualification || !state || !district || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (qualification === '12' && !specialization) {
            return res.status(400).json({ message: 'Specialization is required for 12th pass students' });
        }
        let user = await User.findOne({ email });
        if (user) {
            return res.status(409).json({ message: 'User already exists, please login' });
        }
        user = new User({ name, dob, qualification, specialization, state, district, email, age, gender, academic_interests });
        await user.save();
        // Generate and send OTP
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
        await Otp.findOneAndUpdate(
            { email },
            { otp, expiresAt },
            { upsert: true, new: true }
        );
        await sendOtpEmail(email, otp);
        res.json({ message: 'Registered successfully, OTP sent to email' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found, please register' });

        // Generate and send OTP
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await Otp.findOneAndUpdate(
            { email },
            { otp, expiresAt },
            { upsert: true, new: true }
        );
        await sendOtpEmail(email, otp);
        res.json({ message: 'OTP sent to email' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// In your verifyOtp function
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
        
        const otpDoc = await Otp.findOne({ email });
        if (!otpDoc || otpDoc.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        if (otpDoc.expiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        await Otp.deleteOne({ email });

        const user = await User.findOneAndUpdate({ email }, { isLoggedIn: true }, { new: true }).select('-__v');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // *** FIX: Include the user object in the response ***
        res.json({ message: 'OTP verified', token, user });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
// Logout endpoint
exports.logout = async (req, res) => {
    try {
        const userId = req.user.id;
        await User.findByIdAndUpdate(userId, { isLoggedIn: false });
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.dashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-__v');
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};