const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, phone, password, role, status } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        if (!name) {
            return res.status(400).json({ message: 'Please provide a name' });
        }

        if (!phone) {
            return res.status(400).json({ message: 'Please provide a phone number' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            phone,
            password,
            role: role || 'customer',
            status: status || 'active',
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                orders: user.orders,
                createdAt: user.createdAt,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'User not found in database' });
        }

        const isMatch = await user.matchPassword(password);

        if (user && isMatch) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                orders: user.orders,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all customers
// @route   GET /api/auth/customers
// @access  Private (Admin only)
const getCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: 'customer' }).select('-password');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update customer
// @route   PUT /api/auth/customers/:id
// @access  Private (Admin only)
// @desc    Update customer
// @route   PUT /api/auth/customers/:id
// @access  Private (Admin only)
const updateCustomer = async (req, res) => {
    try {
        const { name, email, phone, status } = req.body;

        const customer = await User.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Use findByIdAndUpdate to bypass the pre-save hook
        const updatedCustomer = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: name || customer.name,
                email: email || customer.email,
                phone: phone || customer.phone,
                status: status || customer.status,
            },
            {
                new: true, // Return the updated document
                runValidators: true, // Run schema validators
            }
        ).select('-password');

        res.json({
            _id: updatedCustomer._id,
            name: updatedCustomer.name,
            email: updatedCustomer.email,
            phone: updatedCustomer.phone,
            status: updatedCustomer.status,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete customer
// @route   DELETE /api/auth/customers/:id
// @access  Private (Admin only)
const deleteCustomer = async (req, res) => {
    try {
        const customer = await User.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login, getProfile, getCustomers, updateCustomer, deleteCustomer };