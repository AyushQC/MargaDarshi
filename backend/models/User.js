const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    qualification: { type: String, enum: ['10', '12'], required: true },
    state: { type: String, default: 'Karnataka' },
    district: { type: String, enum: ['Kalaburagi', 'Koppal'], required: true },
    specialization: { type: String }, // Only for 12th pass
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    academic_interests: [{ type: String }],
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    isLoggedIn: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
