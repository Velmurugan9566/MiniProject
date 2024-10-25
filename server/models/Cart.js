const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    email:String,
    proname: String,
    quantity: Number,
    price: Number,
    totalPrice:Number,
});

const CartModel = mongoose.model("cart",CartSchema);
module.exports = CartModel;