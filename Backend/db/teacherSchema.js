const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    teacherId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true, collection: 'teacher' });

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;