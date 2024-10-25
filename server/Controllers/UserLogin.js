
const UserModel = require('../models/Customer'); // Assuming User schema/model is defined

const UserLogin=(req, res) => {
  const { email, password } = req.body;

    // Check if the user with the given email exists
    UserModel.findOne({email})
    .then(user=> {
      if (user) {
        if (user.password !== password) {
          res.json({ status: 3 });
        } else {
          res.json({ status: 1 });
        }
      } else {
        res.json({ status: 2 });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
};

module.exports = {
    UserLogin,
  };
  