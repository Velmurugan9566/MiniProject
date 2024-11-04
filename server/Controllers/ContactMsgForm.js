const nodemailer = require('nodemailer'); 

const ContactMsgForm = async (req,res) => {

    const {name,email,msg} = req.body.user;
   console.log(name,email,msg,req.body.user)
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'shoppingportalmsu@gmail.com', 
        pass: 'xbnyiodqwxcfuhtq', 
    },
    port: 587,  // Change the port to 587
    secure: false,  // Use TLS instead of SSL
    //port: 465,  // Keep port 465
    //secure: true,  // Ensure SSL is enabled for this port
  });

  
  const emailHTML = `
    <div style="font-family: Arial, sans-serif; margin: 20px;">
    <h2>Vel'z Supermarket </h2>
      <h2 style="color: #333;">${name} Request submitted Succesfully..</h2>
      <div style="margin-bottom: 20px;">
        <h3 style="color: #555;">We will analyze your query and notify quickly</h3>
        <p><strong>Keep in touch</strong></p>
      </div>
      <p style="color: #777;">Have a good day!</p>
    </div>
  `;

  const emailHTML2 = `
    <div style="font-family: Arial, sans-serif; margin: 20px;">
    <h2>Customer FeedBack</h2>
      <h2 style="color: #333;">Details</h2>
      <div style="margin-bottom: 20px;">
        <h3 style="color: #555;">Customer Name ${name}</h3>
        <p><strong>Message is:<br/>${msg} </strong></p>
      </div>
    </div>
  `;

  // Send the email
  const mailOptions = {
    from: 'shoppingportalmsu@gmail.com',
    to: email,
    subject: 'Contact Message',
    html: emailHTML,
  };
  const mailOptions2 = {
    from: 'shoppingportalmsu@gmail.com',
    to: 'shoppingportalmsu@gmail.com',
    subject: 'Contact Message',
    html: emailHTML2,
  };

  try {
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(mailOptions2);
    res.json({status:1})
    console.log('Contact mail sented..');
  } catch (error) {
    res.json({status:2})
    console.error('Error sending email:', error);
  }
//   try {
//     await transporter.sendMail(mailOptions2);
//     res.json({status:1})
//     console.log('Contact mail sented..');
//   } catch (error) {
//     res.json({status:2})
//     console.error('Error sending email:', error);
//   }
  transporter.verify(function(error, success) {
    if (error) {
      console.log('SMTP Server is not ready:', error);
    } else {
      console.log('Server is ready to send emails');
      transporter.sendMail(mailOptions);
    }
  });
  
};

module.exports = { ContactMsgForm };
