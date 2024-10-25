const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
  
  proname: String,
  quantity: Number,
  category: String,
  Subcategory:String,
  Supp_id:String,
  price: Number,
  discount:Number
})

const ProductModel = mongoose.model("product",ProductSchema)
module.exports = ProductModel