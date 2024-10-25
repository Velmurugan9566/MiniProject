
const OrderModel = require('../models/Order');  // Your Order schema
const OrderItemModel = require('../models/OrderItem');  // Your OrderItem schema
const CartModel = require('../models/Cart');
const ProductModel = require('../models/Users');
const SendMailQuantity = require('../Controllers/SendMailQuantity');
const SendMailOrder = require('../Controllers/sendMailOrderPlaced')
const PlaceOrder= async (req, res) => {
  const { user, cart, paymentMethod, orderMethod, grandTotal } = req.body;
  //console.log(user,cart,paymentMethod,orderMethod,grandTotal)
  try {
 
    const newOrder = new OrderModel({
      userId:user,
      paymentMode:paymentMethod,
      paymentStatus: 'Completed', 
      totalAmount: grandTotal,
      orderMode:orderMethod
    });

    const savedOrder = await newOrder.save();


    const orderItemsPromises = cart.map(item => {
      const orderItem = new OrderItemModel({
        orderId: savedOrder._id,
        proname: item.proname,
        price: item.price,
        quantity: item.quantity,
        total: item.totalPrice
      });
      return orderItem.save();  
    });


    await Promise.all(orderItemsPromises);
  

    console.log("inserted..")
    SendMailOrder.sendOrderConfirmationEmail(user, savedOrder._id, orderMethod, paymentMethod, grandTotal, cart);
    SendMailQuantity.sendLowQuantityEmail()
    CartModel.deleteMany({email:user})
    .then(res)
    .catch(err=> console.log("error deletecart",err))
    cart.map(item=>{
      ProductModel.updateOne({proname:item.proname},{$inc:{quantity:-item.quantity}})
      .then(res)
      .catch(err=>console.log("subtract product",err))
    })
    
    res.status(200).json({ message: 'Order placed successfully' ,orderId:savedOrder._id});
  } catch (error) {
    console.error('Error placing order', error);
    res.status(500).json({ message: 'Error placing order' });
  }
};

module.exports ={
    PlaceOrder,
};
