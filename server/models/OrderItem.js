const mongoose = require('mongoose');

// OrderItem Schema
const OrderItemSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Order',  // Reference to the Order schema
        required: true
    },
    proname: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
});

// Create OrderItem Model
const OrderItemModel = mongoose.model('OrderItem', OrderItemSchema);

module.exports = OrderItemModel;
