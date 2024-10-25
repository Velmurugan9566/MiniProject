const Product = require('../models/Users');

const updateProductById = async (req, res) => {
    const productId = req.params.id;
    const { proname, quantity, category, Subcategory, Supp_id, price, discount } = req.body;
    
    //console.log(req.body); // Log input body to ensure values are correct


    const errors = {};
    if (!proname || proname.trim() === '') {
        errors.proname = "Product name is required.";
    }
    if (quantity == null || quantity < 0) {
        errors.quantity = "Quantity must be a non-negative number.";
    }
    if (!category || category.trim() === '') {
        errors.category = "Category is required.";
    }
    if (!Subcategory || Subcategory.trim() === '') {
        errors.Subcategory = "Subcategory is required.";
    }
    if (!Supp_id || Supp_id.trim() === '') {
        errors.Supp_id = "Supplier ID is required.";
    }
    if (price == null || price <= 0) {
        errors.price = "Price must be a non-negative number.";
    }
    if (discount == null || discount < 0 || discount >100) {
        errors.discount = "Discount must be a non-negative number.";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        console.log(typeof quantity, typeof price); 
        
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                proname: proname.toLowerCase(),
                quantity,
                category: category.toLowerCase(),
                Subcategory: Subcategory.toLowerCase(),
                Supp_id,
                price,
                discount
            },
            { new: true } 
        ).lean(); 

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while updating the product." });
    }
};

module.exports = {
    updateProductById,
};
