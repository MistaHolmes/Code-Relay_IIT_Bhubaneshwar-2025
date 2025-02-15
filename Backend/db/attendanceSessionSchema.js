const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    faculty: { type: String, required: true },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    students: [{ type: String }] 
    // students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Add this line
}, { collection: 'attendanceSessions' });

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);
module.exports = AttendanceSession;