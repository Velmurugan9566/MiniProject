const CartModel = require('../models/Cart');
const UpdateCart = async (req, res) => {
    const { cart, email, status } = req.body;
    console.log(cart,email,status);
    try {
        if (status == 1) {
            for (const item of cart) {
                let { proname, quantity, price, totalPrice } = item;
                console.log("Processing item:", item);  // Debug: log each item
            
                // Ensure `totalPrice` and `quantity` are numbers
                quantity = parseInt(quantity, 10); // Convert to integer
                totalPrice = parseFloat(totalPrice); // Convert to floating-point number
            
                if (isNaN(totalPrice) || isNaN(quantity)) {
                    console.error(`Invalid number format for item ${proname}. Total Price: ${totalPrice}, Quantity: ${quantity}`);
                    res.status(400).json({ message: 'Invalid number format in cart' });
                    return;
                }
            
                try {
                    const existingCartItem = await CartModel.findOne({ email, proname });
                    console.log("Existing Cart Item:", existingCartItem);  // Debug: log the existing item
                    
                    if (existingCartItem) {
                        const newQuantity = existingCartItem.quantity + quantity;
                        const newTotalPrice = existingCartItem.totalPrice + totalPrice;
                        console.log("Inside existing, updating cart...");
            
                        try {
                            await CartModel.updateOne(
                                { email, proname },
                                { $set: { quantity: newQuantity, totalPrice: newTotalPrice } }
                            );
                            console.log(`Updated item: ${proname}`);  // Debug: log successful update
                        } catch (updateErr) {
                            console.error(`Error updating item: ${proname}`, updateErr);  // Catch any update errors
                            res.status(500).json({ message: `Error updating item: ${proname}`, error: updateErr.message });
                            return;
                        }
                    } else {
                        const newCartItem = new CartModel({
                            email,
                            proname,
                            quantity,
                            price,
                            totalPrice
                        });
            
                        try {
                            await newCartItem.save();
                            console.log(`Saved new item: ${proname}`);  // Debug: log successful save
                        } catch (saveErr) {
                            console.error(`Error saving new item: ${proname}`, saveErr);  // Catch any save errors
                            res.status(500).json({ message: `Error saving new item: ${proname}`, error: saveErr.message });
                            return;
                        }
                    }
                } catch (findErr) {
                    console.error('Error finding item in cart:', findErr);  // Catch any find errors
                    res.status(500).json({ message: 'Error finding item in cart', error: findErr.message });
                    return;
                }
            }
            
            res.status(200).json({ message: 'Cart updated successfully' });
            
    }else if(status == 2){
        console.log("cart updation ...")
        const result = await CartModel.deleteMany({ email });
        for (const item of cart) {
            const { proname, quantity, price ,totalPrice} = item;
            // quantity = parseInt(quantity, 10); // Convert to integer
            // totalPrice = parseFloat(totalPrice);
                // Product does not exist, create a new cart item
                const newCartItem = new CartModel({
                    email,
                    proname,
                    quantity,
                    price,
                    totalPrice
                });
                await newCartItem.save();
            }
        res.status(200).json({ message: 'Cart updated successfully' });
    }
    } catch (error) {
        res.status(500).json({ message: "Error updating cart", error });
    }
};

module.exports = {
    UpdateCart,
};
