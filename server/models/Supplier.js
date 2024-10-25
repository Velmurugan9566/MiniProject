const mongoose = require('mongoose')

const SuppSchema = new mongoose.Schema({
  suppEmail:String,
  suppPhone:Number,
  suppname: String,
  suppid: String,
  
})
const SuppModel = mongoose.model("suppliers",SuppSchema)
module.exports = SuppModel