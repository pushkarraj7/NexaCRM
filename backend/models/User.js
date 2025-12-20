// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema(
//   {
//     email: {
//       type: String,
//       required: [true, 'Please provide an email'],
//       unique: true,
//       lowercase: true,
//       trim: true,
//       match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
//     },
//     password: {
//       type: String,
//       required: [true, 'Please provide a password'],
//       minlength: 6,
//       select: false,
//     },
//     role: {
//       type: String,
//       enum: ['admin', 'finance', 'customer'],
//       default: 'customer',
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Hash password before saving (this was running even though you removed it)
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// // Method to compare password using bcrypt
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   console.log('🔍 Comparing passwords with bcrypt...');
//   const isMatch = await bcrypt.compare(enteredPassword, this.password);
//   console.log('Match result:', isMatch);
//   return isMatch;
// };

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'finance', 'customer'],
      default: 'customer',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    orders: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving - FIX: Properly call next()
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next(); // IMPORTANT: return next() to exit early
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Call next() after hashing
  } catch (error) {
    next(error); // Pass error to next() if hashing fails
  }
});

// Method to compare password using bcrypt
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);