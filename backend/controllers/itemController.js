const Item = require('../models/Item');

// @desc    Get all items
// @route   GET /api/items
// @access  Private
const getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
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
    const { itemCode, itemCategory, name, unit, quantity, mrp, hsnCode, tax, status } = req.body;

    // Validation
    if (!itemCode || !itemCategory || !name || !unit || !quantity || !mrp || !hsnCode || tax === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if item code already exists
    const itemExists = await Item.findOne({ itemCode });
    if (itemExists) {
      return res.status(400).json({ message: 'Item with this code already exists' });
    }

    // Create item
    const item = await Item.create({
      itemCode,
      itemCategory,
      name,
      unit,
      quantity: Number(quantity),
      mrp: Number(mrp),
      hsnCode,
      tax: Number(tax),
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
    const { itemCode, itemCategory, name, unit, quantity, mrp, hsnCode, tax, status } = req.body;

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if item code is being changed and if it already exists
    if (itemCode && itemCode !== item.itemCode) {
      const itemExists = await Item.findOne({ itemCode });
      if (itemExists) {
        return res.status(400).json({ message: 'Item with this code already exists' });
      }
    }

    // Update item
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        itemCode: itemCode || item.itemCode,
        itemCategory: itemCategory || item.itemCategory,
        name: name || item.name,
        unit: unit || item.unit,
        quantity: quantity !== undefined ? Number(quantity) : item.quantity,
        mrp: mrp !== undefined ? Number(mrp) : item.mrp,
        hsnCode: hsnCode || item.hsnCode,
        tax: tax !== undefined ? Number(tax) : item.tax,
        status: status || item.status,
      },
      {
        new: true,
        runValidators: true,
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