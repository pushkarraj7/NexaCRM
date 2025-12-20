const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema(
  {
    agreementId: {
      type: String,
      required: true,
      unique: true,
    },
    party: {
      type: String,
      required: [true, 'Please add a party name'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please add an agreement type'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please add an end date'],
    },
    amount: {
      type: String,
      required: [true, 'Please add an amount'],
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'terminated'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate agreement ID before validation
agreementSchema.pre('validate', async function () {
  if (!this.agreementId) {
    // Get the count of existing agreements
    const count = await this.constructor.countDocuments();
    this.agreementId = `AGR-${String(count + 1).padStart(3, '0')}`;
  }
});

// Automatically update status based on end date
agreementSchema.pre('save', function () {
  const currentDate = new Date();
  if (this.endDate < currentDate && this.status === 'active') {
    this.status = 'expired';
  }
});

module.exports = mongoose.model('Agreement', agreementSchema);