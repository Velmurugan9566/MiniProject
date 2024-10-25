const mongoose = require('mongoose');

// Order Schema
const OrderSchema = new mongoose.Schema({
    userId:String,
    dateTime: {
        type: Date,
        default: Date.now,  // Automatically sets the current timestamp
        required: true
    },
    paymentMode: String,
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    orderMode: String
});

// Create Order Model
const OrderModel = mongoose.model('Order', OrderSchema);

module.exports = OrderModel;
