const nodemailer = require('nodemailer');
const ProductModel = require('../models/Users'); 
const SuppModel = require('../models/Supplier'); 

// Function to send the email
const sendLowQuantityEmail = async () => {
  // Query products with low quantity (you can adjust the threshold as needed)
  const lowQuantityProducts = await ProductModel.find({ quantity: { $lt: 10 } });
    
    // Create an array to hold product details along with supplier info
    const productsWithSupplier = await Promise.all(lowQuantityProducts.map(async (product) => {
      // Fetch supplier details based on the Supp_id in the product
      const supplier = await SuppModel.findOne({ suppname:product.Supp_id });

      // Check if supplier is found
      if (supplier) {
        return {
          proname: product.proname,
          quantity: product.quantity,
          suppname: supplier.suppname,
          suppEmail: supplier.suppEmail
        };
      } else {
        return {
          proname: product.proname,
          quantity: product.quantity,
          suppname: 'Supplier Not Found',
          suppEmail: 'N/A'
        };
      }
    }));

    //console.log(productsWithSupplier);

  if (productsWithSupplier.length === 0) return;
  //console.log(productsWithSupplier)
  // Prepare the table rows with product and supplier details
  const rows = productsWithSupplier.map(product => {
    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${product.proname}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${product.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${product.suppname}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${product.suppEmail}</td>
      </tr>
    `;
  }).join('');

  // Prepare the email content
  const emailHTML = `
    <html>
      <head>
        <style>
          /* Basic styles */
          body { font-family: Arial, sans-serif; }
          h2 { color: red; }
          
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            text-align: left;
            padding: 8px;
            border: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
          }
          /* Responsive design */
          @media only screen and (max-width: 600px) {
            table {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <h2>Low Quantity Products Report - ${new Date().toLocaleString()}</h2>
        <h3>Quantities are below 10</h3>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Current Quantity</th>
              <th>Supplier Name</th>
              <th>Supplier Email</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Configure the mail transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'shoppingportalmsu@gmail.com', 
      pass: 'xbnyiodqwxcfuhtq', 
    }
  });

  // Send the email
  const mailOptions = {
    from: 'shoppingportalmsu@gmail.com',
    to: 'shoppingportalmsu@gmail.com', 
    subject: 'Low Quantity Products Report',
    html: emailHTML,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = {
    sendLowQuantityEmail,
};
