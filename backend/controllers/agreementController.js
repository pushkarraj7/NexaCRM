const Agreement = require('../models/Agreement');

// @desc    Get all agreements
// @route   GET /api/agreements
// @access  Private
const getAgreements = async (req, res) => {
  try {
    const agreements = await Agreement.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: agreements.length,
      data: agreements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get single agreement
// @route   GET /api/agreements/:id
// @access  Private
const getAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id);

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found',
      });
    }

    res.json({
      success: true,
      data: agreement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Create new agreement
// @route   POST /api/agreements
// @access  Private
const createAgreement = async (req, res) => {
  try {
    const { party, type, startDate, endDate, amount } = req.body;

    // Validation
    if (!party || !type || !startDate || !endDate || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Create agreement
    const agreement = await Agreement.create({
      party,
      type,
      startDate,
      endDate,
      amount,
      createdBy: req.user ? req.user.id : null,
    });

    res.status(201).json({
      success: true,
      data: agreement,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create agreement',
      error: error.message,
    });
  }
};

// @desc    Update agreement
// @route   PUT /api/agreements/:id
// @access  Private
const updateAgreement = async (req, res) => {
  try {
    let agreement = await Agreement.findById(req.params.id);

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found',
      });
    }

    agreement = await Agreement.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      data: agreement,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update agreement',
      error: error.message,
    });
  }
};

// @desc    Delete agreement
// @route   DELETE /api/agreements/:id
// @access  Private
const deleteAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id);

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found',
      });
    }

    await agreement.deleteOne();

    res.json({
      success: true,
      message: 'Agreement deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get agreements by status
// @route   GET /api/agreements/status/:status
// @access  Private
const getAgreementsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['active', 'expired', 'terminated'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const agreements = await Agreement.find({ status }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: agreements.length,
      data: agreements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Update agreement status
// @route   PATCH /api/agreements/:id/status
// @access  Private
const updateAgreementStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'expired', 'terminated'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const agreement = await Agreement.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found',
      });
    }

    res.json({
      success: true,
      data: agreement,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update status',
      error: error.message,
    });
  }
};

module.exports = {
  getAgreements,
  getAgreement,
  createAgreement,
  updateAgreement,
  deleteAgreement,
  getAgreementsByStatus,
  updateAgreementStatus,
};