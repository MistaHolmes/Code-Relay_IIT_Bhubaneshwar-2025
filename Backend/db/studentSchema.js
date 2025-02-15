const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    studentId: { 
        type: String, 
        required: true, // <-- Critical validation
        unique: true 
    },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subject: {
        OS: { type: Number, default: 0 },
        DAA: { type: Number, default: 0 },
        DCCN: { type: Number, default: 0 },
        DE: { type: Number, default: 0 }
    },
    attendance: [
        {
            sessionId: { type: String },
            subject: { type: String },
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true, collection: 'student' });

const User = mongoose.model('User', userSchema);

module.exports = User;
