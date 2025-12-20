const Item = require('../models/Item');

// @desc    Get all items
// @route   GET /api/items
// @access  Private
const getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 }); // Sort by newest first
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Private
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private (Admin only)
const createItem = async (req, res) => {
  try {
    const { name, description, price, status } = req.body;

    // Validation
    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if item already exists
    const itemExists = await Item.findOne({ name });
    if (itemExists) {
      return res.status(400).json({ message: 'Item with this name already exists' });
    }

    // Create item
    const item = await Item.create({
      name,
      description,
      price,
      status: status || 'active',
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (Admin only)
const updateItem = async (req, res) => {
  try {
    const { name, description, price, status } = req.body;

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update item using findByIdAndUpdate to avoid pre-save hooks
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        name: name || item.name,
        description: description || item.description,
        price: price !== undefined ? price : item.price,
        status: status || item.status,
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    );

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (Admin only)
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};