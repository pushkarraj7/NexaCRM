// controllers/invoiceController.js
const Invoice = require('../models/Invoice');
const Proforma = require('../models/Proforma');

// Get all invoices
const getAllInvoices = async (req, res) => {
  try {
    const { paymentStatus, search } = req.query;
    
    let query = {};
    
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    const invoices = await Invoice.find(query)
      .populate('customerId', 'name email phone')
      .populate('orderId', 'orderNumber')
      .populate('proformaId', 'proformaNumber')
      .sort({ createdAt: -1 });

    // Apply search filter if provided
    let filteredInvoices = invoices;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredInvoices = invoices.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.customerId?.name?.toLowerCase().includes(searchLower) ||
        inv.orderId?.orderNumber?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: filteredInvoices
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single invoice
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customerId')
      .populate('orderId')
      .populate('proformaId');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });

  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paidAmount, paymentMethod } = req.body;

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (paidAmount !== undefined) {
      invoice.paidAmount = paidAmount;
      
      // Auto-update payment status based on amount
      if (paidAmount === 0) {
        invoice.paymentStatus = 'unpaid';
      } else if (paidAmount >= invoice.totalAmount) {
        invoice.paymentStatus = 'paid';
      } else {
        invoice.paymentStatus = 'partial';
      }
    } else if (paymentStatus) {
      invoice.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      invoice.paymentMethod = paymentMethod;
    }

    await invoice.save();

    res.json({
      success: true,
      message: 'Payment status updated',
      data: invoice
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update invoice details
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });

  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // If invoice had a proforma, update it back to pending
    if (invoice.proformaId) {
      await Proforma.findByIdAndUpdate(invoice.proformaId, {
        status: 'pending',
        convertedToInvoiceId: null,
        convertedDate: null
      });
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  updatePaymentStatus,
  updateInvoice,
  deleteInvoice
};