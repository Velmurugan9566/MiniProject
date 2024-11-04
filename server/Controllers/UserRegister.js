
const nodemailer = require('nodemailer');
const UserModel = require('../models/Customer');

const UserRegister= async (req, res) => {
  const { name, age, gender, phone, email, password } = req.body;
  // Server-side validation
  if (!name || !age || !gender || !phone || !email || !password) {
    return res.json({status:2, message: 'All fields are required' });
  }
  if (age < 0) {
    return res.json({status:2, message: 'Age cannot be negative' });
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    return res.json({status:2, message: 'Phone number must be 10 digits' });
  }
  if (!/.+\@.+\..+/.test(email)) {
    return res.json({status:2, message: 'Invalid email format' });
  }

  try {
    // Check if a user with the same email exists
    const existingUser = await UserModel.findOne({ email });
    
    if (existingUser) {
      // If email already exists, return a message with user ID
      return res.json({
        status:1,
        message: 'Email ID already exists',
      });
    }

    // Save new user to the database
    const newUser = new UserModel({ name, age, gender, phone, email, password });
    await newUser.save();
    sendRegistrationEmail(email, name);
    res.json({ status:3, message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.json({ status:4,message: 'Server error',err:error});
  }
};
const sendRegistrationEmail = (email, name) => {
  // Create the transporter using your SMTP credentials (for example, using Gmail)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fundamentalbhaikl@gmail.com', 
      pass: 'fkitdqsmwtfqlyog', 
    },
  });

  const mailOptions = {
    from: 'fundamentalbhaikl@gmail.com',
    to: email,
    subject: 'Welcome to My Shop',
    html: `<html><p style="color:blue;">Hello <strong>${name}</strong>,</p>
           <p>Thank you for registering on our platform! We're excited to have you with us.</p>
           <p>Best regards,<br>M.Velmurugan</p></html>`
  };
  

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
module.exports = {
    UserRegister,
};