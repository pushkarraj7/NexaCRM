// controllers/proformaController.js
const Proforma = require('../models/Proforma');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');

// Generate proforma from order
const generateProforma = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('customerId');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if proforma already exists
    // Prevent duplicate invoice
    const existingInvoice = await Invoice.findOne({ proformaId: proforma._id });
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: 'Invoice already generated for this proforma',
        invoiceId: existingInvoice._id
      });
    }


    // Create proforma
    const proforma = new Proforma({
      orderId: order._id,
      customerId: order.customerId._id,
      items: order.items,
      totalAmount: order.totalAmount,
      notes: order.notes,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await proforma.save();

    res.status(201).json({
      success: true,
      message: 'Proforma invoice generated successfully',
      data: proforma
    });

  } catch (error) {
    console.error('Error generating proforma:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all proformas
const getAllProformas = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const proformas = await Proforma.find(query)
      .populate('customerId', 'name email phone')
      .populate('orderId', 'orderNumber')
      .populate('convertedToInvoiceId', 'invoiceNumber')
      .sort({ createdAt: -1 });

    // Apply search filter if provided
    let filteredProformas = proformas;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProformas = proformas.filter(p =>
        p.proformaNumber.toLowerCase().includes(searchLower) ||
        p.customerId?.name?.toLowerCase().includes(searchLower) ||
        p.orderId?.orderNumber?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: filteredProformas
    });

  } catch (error) {
    console.error('Error fetching proformas:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single proforma
const getProformaById = async (req, res) => {
  try {
    const proforma = await Proforma.findById(req.params.id)
      .populate('customerId')
      .populate('orderId')
      .populate('convertedToInvoiceId');

    if (!proforma) {
      return res.status(404).json({ success: false, message: 'Proforma not found' });
    }

    res.json({ success: true, data: proforma });

  } catch (error) {
    console.error('Error fetching proforma:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Convert proforma to sale invoice
const convertProformaToInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { dueDate, paymentMethod, notes } = req.body;

    const proforma = await Proforma.findById(id)
      .populate('customerId')
      .populate('orderId');

    if (!proforma) {
      return res.status(404).json({ success: false, message: 'Proforma not found' });
    }

    if (proforma.status === 'converted') {
      return res.status(400).json({
        success: false,
        message: 'Proforma already converted'
      });
    }

    const existingInvoice = await Invoice.findOne({ proformaId: proforma._id });
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: 'Invoice already exists',
        invoiceId: existingInvoice._id
      });
    }

    const invoice = new Invoice({
      proformaId: proforma._id,
      orderId: proforma.orderId._id,
      customerId: proforma.customerId._id,
      items: proforma.items,
      totalAmount: proforma.totalAmount,
      dueDate: dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      paymentMethod,
      notes: notes || proforma.notes,
      paymentStatus: 'unpaid',
      paidAmount: 0
    });

    await invoice.save();

    proforma.status = 'converted';
    proforma.convertedToInvoiceId = invoice._id;
    proforma.convertedDate = new Date();
    await proforma.save();

    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber
      }
    });

  } catch (error) {
    console.error('Error converting proforma:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Update proforma status
const updateProformaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const proforma = await Proforma.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!proforma) {
      return res.status(404).json({ success: false, message: 'Proforma not found' });
    }

    res.json({
      success: true,
      message: 'Proforma status updated',
      data: proforma
    });

  } catch (error) {
    console.error('Error updating proforma:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete/Cancel proforma
const deleteProforma = async (req, res) => {
  try {
    const proforma = await Proforma.findById(req.params.id);

    if (!proforma) {
      return res.status(404).json({ success: false, message: 'Proforma not found' });
    }

    if (proforma.status === 'converted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete converted proforma'
      });
    }

    proforma.status = 'cancelled';
    await proforma.save();

    res.json({
      success: true,
      message: 'Proforma cancelled successfully'
    });

  } catch (error) {
    console.error('Error deleting proforma:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateProforma,
  getAllProformas,
  getProformaById,
  convertProformaToInvoice, // ✅ updated export
  updateProformaStatus,
  deleteProforma
};
