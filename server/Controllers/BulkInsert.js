const Product = require('../models/Users');
const CategoryModel = require('../models/Category');
const SupplierModel=require('../models/Supplier')
// Update product by ID
const BulkInsert = async (req, res) => {
    var dupdata =[]
    var productname=[]
    var procate =[]
    var suppname=[]
    var productdata=req.body.jsonData
    var flag=0
    productdata.forEach((element,i) => {
       productname.push(element.proname.toLowerCase())
       if( !procate.includes(element.category.toLowerCase())){
         procate.push(element.category.toLowerCase())}  
       suppname.push(element.Supp_id)
       element.proname=element.proname.toLowerCase()
       element.category=element.category.toLowerCase()
       element.Subcategory=element.Subcategory.toLowerCase()
    });

    Product.find({proname:{$in:productname}})
    .then((msg)=>{
      if(msg.length >0 ){
         flag=1;
        msg.forEach(element => {
          dupdata.push(element.proname)
          });
        res.json({status:2,data:dupdata})
      }else{
          productdata.forEach(e => {
            const errors = {};
            if (!e.proname || e.proname.trim() === '') {
                errors.proname = "Product name is required.";
            }
            if (e.quantity == null || e.quantity < 0) {
                errors.quantity = "Quantity must be a non-negative number.";
            }
            if (!e.category || e.category.trim() === '') {
                errors.category = "Category is required.";
            }
            if (!e.Subcategory || e.Subcategory.trim() === '') {
                errors.Subcategory = "Subcategory is required.";
            }
            if (!e.Supp_id || e.Supp_id.trim() === '') {
                errors.Supp_id = "Supplier ID is required.";
            }
            if (e.price == null || e.price < 0) {
                errors.price = "Price must be a non-negative number.";
            }
            if (e.discount == null || e.discount < 0) {
                errors.discount = "Discount must be a non-negative number.";
            }
            if (Object.keys(errors).length > 0) {
                console.log(errors)
                return res.json({status:3,err:errors });
            }
        });
        if(flag==0){
            procate.forEach(async (cate) => {
                await CategoryModel.updateOne(
                    { catename: cate },  // Query to match existing documents
                    { $setOnInsert: { catename: cate} },  // Fields to insert if not found
                    { upsert: true }  // Insert if no match found
                );
            });
            console.log(suppname)
            suppname.forEach(async (name) => {
                await SupplierModel.updateOne(
                    { suppname: name },  // Query to match existing documents
                    { $setOnInsert: { suppname: name} },  // Fields to insert if not found
                    { upsert: true }  // Insert if no match found
                );
            });
            Product.insertMany(productdata)
            .then(msg=>res.json({status:1}))
            .catch(err=>res.json({status:3}))
        }
      }
    })
    .catch(err=>console.log(err))
  
    const { proname, quantity, category, Subcategory, Supp_id, price, discount } = req.body;

    // Server-side validation
   
    // If there are validation errors, return them to the client
   
};
module.exports = {
    BulkInsert,
};