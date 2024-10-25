const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  Aname: String,
  Aemail: String,
  Aphone: Number,
  Aid: Number,
  Apass: String,
});

const AdminModel = mongoose.model("admins",AdminSchema);
module.exports = AdminModel;