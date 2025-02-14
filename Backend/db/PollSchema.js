const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    options: [
        {
            text: { type: String, required: true },
            votes: { type: Number, default: 0 }
        }
    ],
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
});

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;