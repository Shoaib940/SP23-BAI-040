const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved'],
        default: 'pending'
    },
    adminResponse: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema); 