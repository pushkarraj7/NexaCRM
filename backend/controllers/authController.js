const User = require('../models/User');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user (Admin/Finance)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, phone, password, role, status } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        if (!name) {
            return res.status(400).json({ message: 'Please provide a name' });
        }

        if (!phone) {
            return res.status(400).json({ message: 'Please provide a phone number' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

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

// @desc    Register new customer
// @route   POST /api/auth/register-customer
// @access  Private (Admin only)
const registerCustomer = async (req, res) => {
    try {
        const { customerId, name, email, phone, password, status } = req.body;

        console.log('Received customer registration request:', { customerId, name, email, phone, status });

        if (!customerId || !name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const customerIdExists = await Customer.findOne({ customerId: customerId.toUpperCase() });
        if (customerIdExists) {
            return res.status(400).json({ message: 'Customer ID already exists' });
        }

        const emailExists = await Customer.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        console.log('Creating new customer...');

        const customer = await Customer.create({
            customerId: customerId.toUpperCase(),
            name,
            email,
            phone,
            password,
            status: status || 'active',
        });

        console.log('Customer created successfully:', customer._id);

        if (customer) {
            res.status(201).json({
                _id: customer._id,
                customerId: customer.customerId,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                status: customer.status,
                orders: customer.orders,
                createdAt: customer.createdAt,
            });
        }
    } catch (error) {
        console.error('Error in registerCustomer:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user (Admin/Finance)
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

// @desc    Login customer
// @route   POST /api/auth/customer-login
// @access  Public
const customerLogin = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Please provide login credentials and password' });
        }

        const customer = await Customer.findOne({
            $or: [
                { customerId: identifier.toUpperCase() },
                { email: identifier.toLowerCase() }
            ]
        }).select('+password');

        if (!customer) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (customer.status === 'inactive') {
            return res.status(403).json({ message: 'Account is inactive. Please contact admin.' });
        }

        const isMatch = await customer.matchPassword(password);

        if (customer && isMatch) {
            res.json({
                _id: customer._id,
                customerId: customer.customerId,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                status: customer.status,
                orders: customer.orders,
                token: generateToken(customer._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Customer login error:', error);
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

// @desc    Get customer profile
// @route   GET /api/auth/customer-profile
// @access  Private
const getCustomerProfile = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id);

        if (customer) {
            res.json({
                _id: customer._id,
                customerId: customer.customerId,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                status: customer.status,
                orders: customer.orders,
            });
        } else {
            res.status(404).json({ message: 'Customer not found' });
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
        const customers = await Customer.find({}).select('-password').sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update customer
// @route   PUT /api/auth/customers/:id
// @access  Private (Admin only)
const updateCustomer = async (req, res) => {
    try {
        const { customerId, name, email, phone, status } = req.body;

        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        if (customerId && customerId.toUpperCase() !== customer.customerId) {
            const customerIdExists = await Customer.findOne({
                customerId: customerId.toUpperCase(),
                _id: { $ne: req.params.id }
            });

            if (customerIdExists) {
                return res.status(400).json({ message: 'Customer ID already exists' });
            }
        }

        if (email && email.toLowerCase() !== customer.email) {
            const emailExists = await Customer.findOne({
                email: email.toLowerCase(),
                _id: { $ne: req.params.id }
            });

            if (emailExists) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.id,
            {
                customerId: customerId ? customerId.toUpperCase() : customer.customerId,
                name: name || customer.name,
                email: email || customer.email,
                phone: phone || customer.phone,
                status: status || customer.status,
            },
            {
                new: true,
                runValidators: true,
            }
        ).select('-password');

        res.json({
            _id: updatedCustomer._id,
            customerId: updatedCustomer.customerId,
            name: updatedCustomer.name,
            email: updatedCustomer.email,
            phone: updatedCustomer.phone,
            status: updatedCustomer.status,
            orders: updatedCustomer.orders,
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
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await Customer.findByIdAndDelete(req.params.id);

        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    registerCustomer,
    login,
    customerLogin,
    getProfile,
    getCustomerProfile,
    getCustomers,
    updateCustomer,
    deleteCustomer
};