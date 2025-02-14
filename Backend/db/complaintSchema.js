const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    subject: { type: String },
    faculty: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    upvotedBy: [{ type: String }]
}, { collection: 'complaints' });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;