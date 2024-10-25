const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();
const Product = require('./models/Users');
const Adminlog= require('./models/Admin');
const Catelist = require('./models/Category');
const Supplier = require('./models/Supplier');
const User = require('./models/Customer');
const cartModel = require('./models/Cart');
const TransactionModel = require('./models/OrderItem');
const OrderModel = require('./models/Order');
const { updateProductById } = require('./Controllers/ProductUpdate');
const { renameCategory } = require('./Controllers/CategoryUpdate');
const {BulkInsert} = require('./Controllers/BulkInsert');
const {UserRegister} = require('./Controllers/UserRegister');
const {UserLogin} = require('./Controllers/UserLogin');
const {UpdateCart} =require('./Controllers/UpdateCart');
const {PlaceOrder} = require('./Controllers/PlaceOrder');
const {ContactMsgForm} =require('./Controllers/ContactMsgForm');
const corsOptions = {
  origin: 'https://simple-login-frontend-seven.vercel.app',
  methods: ['POST', 'GET', 'PUT','DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
mongoose.connect(process.env.MONGO_URI,{  
//mongoose.connect('mongodb+srv://velmca24:vel9566@cluster0.i4qp0rb.mongodb.net/grocery?retryWrites=true&w=majority&appName=Cluster0', {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});
app.options('*', cors(corsOptions));


app.get('/categories', async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/subcategories/:category', async (req, res) => {
  try {
    const category = req.params.category;
    // Fetch distinct subcategories for the given category
    const subcategories = await Product.distinct('Subcategory', { category: category });
    if (subcategories.length === 0) {
      return res.status(404).json({});
    }
    res.status(200).json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Server error while fetching subcategories.' });
  }
});
app.post('/Addcate',(req, res) => {
  const {cate,id} =req.body;
  //console.log(cate);
  Catelist.findOne({catename:cate})
  .then(re =>{
      if (re){
          res.json({status:2})
      }
      else{
          Catelist.create({catename:cate,cateid:id})
          .then(user => res.json({status:1}))
          .catch(err => res.json(err))
      }
  })
  .catch(err => res.json(err))
      
});
app.post('/Addsupp',(req, res) => {
  const {suppname,suppid} =req.body;
  //console.log(suppname);
  Supplier.findOne({suppid:suppid})
  .then(re =>{
      if (re){
          res.json({status:2})
      }
      else{
          Supplier.create(req.body)
          .then(user => res.json({status:1}))
          .catch(err => res.json(err))
      }
  })
  .catch(err => res.json(err))
      
});

app.get('/getProduct/:id',(req, res) => {
    const { id } = req.params;
    //console.log(id)
    Product.findById(id)
    .then(re=>res.json(re))
    .catch(err=>res.json(err))
});

app.get('/getCate',(req,res)=>{
   Catelist.find()
   .then(re=>res.json(re))
   .catch(er=>res.json(er))
  
})
app.get('/getSupp',(req,res)=>{
   Supplier.find()
   .then(re=>res.json(re))
   .catch(er=>res.json(er))
})
app.get('/getSubcategories',(req, res) => {

    Product.distinct('Subcategory')
    .then(re=>res.json(re))
    .catch(err=>res.json(err))
});
app.get('/categorieswithcount', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category', 
          productCount: { $sum: 1 }, // Count the number of products in each category
        }
      },
      {
        $project: {
          category: '$_id',
          productCount: 1,
          _id: 0 // Exclude the _id field from the output
        }
      }
    ]);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/updateProduct/:id', updateProductById); //update product
app.put('/renamecategory', renameCategory);   //Update category name...

app.delete('/deleteProducts', (req, res) => {
  const { ids } = req.body; 
  Product.deleteMany({ _id: { $in: ids } })
    .then(() => res.json({ message: 'Products deleted successfully' }))
    .catch(err => res.status(500).json({ error: 'Error deleting products' }));
});
app.delete('/deleteCategory', (req, res) => {
  const { category } = req.body;
  //console.log(req.body);
  Catelist.deleteOne(req.body) // Corrected to deleteOne
  .then(() => {
    // Then, delete all products with the same category name in the Product model
    return Product.deleteMany(req.body);
  })
    .then(() => res.json({ msg: "Category and Associated  Products Deleted Successfully.." }))
    .catch(err => res.status(500).json(err)); // Added proper error handling
});

app.get('/products/:Subcategory', async (req, res) => {
    const { Subcategory } = req.params;
    try {
        const products = await Product.find({ Subcategory });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/AdminProductsView/:category', async (req, res) => {
    const { category } = req.params;
    try {
        const products = await Product.find({ category });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/products", async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app.get("/product/:name", async (req, res) => {
    try {
      console.log( req.params.name)
      const product = await Product.findOne({_id: req.params.name });
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app.get("/Alogin", (req, res) => {
    const { u, pass } = req.query;
    Adminlog.findOne({Aid: u })
      .then(admin => {
        if (admin) {
          if (admin.Apass !== pass) {
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
  });
  app.post("/AddPro",(req,res)=>{
    //console.log(req.body.formData);
      const v=req.body.formData;
      Product.findOne({proname:v.productName})
      .then((data)=>{
        if(data){
            res.json({status:2})
        }else{
          Product.create({proname:v.productName,quantity:Number(v.productQuantity),price:Number(v.productPrice),category:v.category,Subcategory:v.Subcategory,discount:v.discount,Supp_id:v.supp_id})
          .then(msg => res.json({status:1}))
          .catch(err => res.json({status:3,msg:err}))
        }
      })
      .catch(err => res.json({status:3,msg:err}))
  })
  app.post("/AddBulkPro",BulkInsert)
  app.post("/register",UserRegister)
  app.post("/login",UserLogin);
  app.get("/getuser",(req,res)=>{
    const {name} = req.query;
    User.findOne({ email:name })
    .then(user=>{
      //console.log(user);
      if(user){
        res.json({status:1,detail:user})
      }else{
        res.json({status:2})
      }
    })
    .catch(err=>res.json(err))
  })
  app.put('/update-user/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, age, gender, phone } = req.body;
    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { name, email, age, gender, phone },
        { new: true } // Return the updated document
      );
  
      if (updatedUser) {
        return res.status(200).json({ success: true, user: updatedUser });
      } else {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
  app.get('/fetchCart/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const cartItems = await cartModel.find({ email });
        if (cartItems) {
            //console.log(cartItems);
            res.status(200).json(cartItems);
        } else {
          console.log("no items");
            res.status(404).json({ message: "Cart is empty" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart", error });
    }
});
app.put('/updateCart',UpdateCart);
app.delete('/deleteCart', (req, res) => {
  const { email, n } = req.query;
  cartModel.deleteOne({ email: email, proname: n })
    .then(() => {
      //console.log("Product deleted.");
      res.status(200).send({ message: 'Product deleted successfully' });
    })
    .catch((error) => {
      console.error("Product not deleted", error);
      res.status(500).send({ message: 'Error deleting product' });
    });
});
app.post('/placeOrder',PlaceOrder);
// Fetch low quantity products
app.get('/products_low_quantity', async (req, res) => {
  try {
    const lowQuantityProducts = await Product.find({ quantity: { $lt: 10 } });
    res.json(lowQuantityProducts);
  } catch (err) {
    res.status(500).send('Error retrieving low quantity products');
  }
});

// Fetch today's transactions
app.get('/transactions/today', async (req, res) => {
  try {
    // Get the start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Query the database for orders within today's date range
    const todayTransactions = await OrderModel.find({
      dateTime: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      paymentStatus: 'Completed' // Optional filter for only completed transactions
    }).populate('userId'); // Optional if you want to include user details

    res.status(200).json(todayTransactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today\'s transactions', error });
  }
});
app.get('/FetchOrders', async (req, res) => {
  try {
      const orders = await OrderModel.find();
      const minDateOrder = await OrderModel.findOne().sort({ dateTime: 1 });
      const maxDateOrder = await OrderModel.findOne().sort({ dateTime: -1 });

      const minDate = minDateOrder ? minDateOrder.dateTime : null;
      const maxDate = maxDateOrder ? maxDateOrder.dateTime : null;

      res.status(200).json({ orders, minDate, maxDate });
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders and date range' });
  }
});
app.get('/FilterOrder', async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
      const orders = await OrderModel.find({
          dateTime: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
          }
      });
      res.status(200).json(orders);
  } catch (error) {
      res.status(500).json({ error: 'Failed to filter orders' });
  }
});
app.get('/RevenueOrder', async (req, res) => {
  const { month } = req.query;
   console.log(req.body);
  try {
      const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
      const endOfMonth = new Date(new Date().getFullYear(), month, 0);
      const orders = await OrderModel.aggregate([
          {
              $match: {
                  dateTime: {
                      $gte: startOfMonth,
                      $lt: endOfMonth
                  }
              }
          },
          {
              $group: {
                  _id: { $dayOfMonth: '$dateTime' },
                  totalRevenue: { $sum: '$totalAmount' }
              }
          },
          {
              $sort: { _id: 1 }
          }
      ]);

      const formattedRevenue = orders.map(order => ({
          date: order._id,
          totalRevenue: order.totalRevenue
      }));
      res.status(200).json(formattedRevenue);
  } catch (error) {
      res.status(200).json({ error: 'Failed to fetch monthly revenue' });
  }
});
app.get('/FrequentItems', async (req, res) => {
  try {
      const frequentItems = await TransactionModel.aggregate([
          {
              $group: {
                  _id: '$proname',
                  quantity: { $sum: '$quantity' }
              }
          },
          {
              $sort: { quantity: -1 }
          },
          {
              $limit: 10  // Adjust the limit as necessary
          }
      ]);

      const formattedItems = frequentItems.map(item => ({
          proname: item._id,
          quantity: item.quantity
      }));

      res.status(200).json(formattedItems);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch frequent items' });
  }
});
app.get('/customersWithOrder', async (req, res) => {
  try {
    // Fetch all customers
    const customers = await User.find();

    if (customers.length === 0) {
      return res.status(404).json({ message: "No customers found" });
    }

    // Fetch orders for each customer and combine the data
    const customerDetails = await Promise.all(customers.map(async (customer) => {
      const orders = await OrderModel.find({ userId: customer.email });
      return {
        user: customer,
        orders: orders
      };
    }));

    res.status(200).json(customerDetails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer details", error });
  }
});
app.post('/ContactMsg',ContactMsgForm)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});