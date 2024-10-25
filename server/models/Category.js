const mongoose = require('mongoose')

const CateSchema = new mongoose.Schema({
  
  catename: String,
  cateid: Number,
  
})
const CateModel = mongoose.model("category",CateSchema)
module.exports = CateModel