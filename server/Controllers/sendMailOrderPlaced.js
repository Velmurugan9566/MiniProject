const nodemailer = require('nodemailer'); 

const sendOrderConfirmationEmail = async (userEmail, orderId, orderMethod, paymentMethod, grandTotal, cart) => {

  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'shoppingportalmsu@gmail.com', 
      pass: 'xbnyiodqwxcfuhtq', 
    },
  });

  
  const emailHTML = `
    <div style="font-family: Arial, sans-serif; margin: 20px;">
    <h2>Order Placed Successfully...</h2>
      <h2 style="color: #333;">Order Summary</h2>
      <div style="margin-bottom: 20px;">
        <h3 style="color: #555;">Order Details</h3>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Delivery Method:</strong> ${orderMethod}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Grand Total:</strong> Rs.${grandTotal}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #dddddd; padding: 8px;">Product Name</th>
            <th style="border: 1px solid #dddddd; padding: 8px;">Quantity</th>
            <th style="border: 1px solid #dddddd; padding: 8px;">Price</th>
            <th style="border: 1px solid #dddddd; padding: 8px;">Total Price</th>
          </tr>
        </thead>
        <tbody>
          ${cart.map(item => `
            <tr>
              <td style="border: 1px solid #dddddd; padding: 8px;">${item.proname}</td>
              <td style="border: 1px solid #dddddd; padding: 8px;">${item.quantity}</td>
              <td style="border: 1px solid #dddddd; padding: 8px;">Rs.${item.price}</td>
              <td style="border: 1px solid #dddddd; padding: 8px;">Rs.${item.totalPrice}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p style="color: #777;">Thank you for shopping with us!</p>
    </div>
  `;

  // Send the email
  const mailOptions = {
    from: 'shoppingportalmsu@gmail.com',
    to: userEmail,
    subject: 'Order Confirmation',
    html: emailHTML,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendOrderConfirmationEmail };
