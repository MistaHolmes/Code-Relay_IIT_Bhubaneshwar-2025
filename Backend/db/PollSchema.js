
const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true,
        minlength: [3, "Title must be at least 3 characters long"]
    },
    description: { 
        type: String, 
        trim: true 
    },
    options: [
        {
            text: { 
                type: String, 
                required: true,
                trim: true,
                minlength: [1, "Option text cannot be empty"]
            },
            votes: { 
                type: Number, 
                default: 0 
            }
        }
    ],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    votedBy: { 
        type: [String], 
        default: [] 
    }
});

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;