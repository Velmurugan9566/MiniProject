const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 0 },
  gender: { type: String, required: true },
  phone: { type: String, required: true, match: /^[0-9]{10}$/},
  email: { type: String, required: true, match: /.+\@.+\..+/, unique: true },
  password: { type: String, required: true },
});

const UserModel = mongoose.model('UserRegister', UserSchema);
module.exports = UserModel;
