const mongoose = require('mongoose');

const faceEmbeddingSchema = new mongoose.Schema({
    faceEmbedding: { type: [Number], required: true }, 
});

module.exports = mongoose.model('FaceEmbedding', faceEmbeddingSchema);