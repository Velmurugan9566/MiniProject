// controllers/categoryController.js

const Category = require('../models/Category');
const Product = require('../models/Users');

// Rename category and update related products
const renameCategory = async (req, res) => {
  console.log(req.body)
  const { oldName, newName } = req.body;

  try {
    // Update the category name in the Category collection
    const category = await Category.findOneAndUpdate(
      { catename: oldName },
      { catename: newName.toLowerCase() },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update the category name in the Product collection
    await Product.updateMany(
      { category: oldName },
      { $set: { category: newName.toLowerCase() } }
    );

    res.json({ message: 'Category renamed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error renaming category' });
  }
};

module.exports = {
  renameCategory,
};
