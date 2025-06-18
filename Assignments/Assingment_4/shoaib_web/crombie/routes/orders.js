const express = require('express');
const router = express.Router();
const authRouter = require('./auth');
const Order = require('../models/Order');

// Checkout page
router.get('/checkout', authRouter.isAuthenticated, (req, res) => {
    try {
        // Initialize cart if it doesn't exist
        if (!req.session.cart) {
            req.session.cart = {
                items: [],
                totalQty: 0,
                totalPrice: 0
            };
        }

        // Validate cart data
        if (!req.session.cart.items || !Array.isArray(req.session.cart.items) || req.session.cart.items.length === 0) {
            req.flash('error', 'Your cart is empty');
            return res.redirect('/cart');
        }

        // Ensure all items have required properties
        const validItems = req.session.cart.items.every(item => 
            item.product && 
            item.product._id && 
            item.product.name && 
            item.product.price && 
            item.quantity
        );

        if (!validItems) {
            req.flash('error', 'Invalid cart data. Please try adding items again.');
            return res.redirect('/cart');
        }

        // Calculate totals to ensure they're correct
        const totalQty = req.session.cart.items.reduce((total, item) => total + item.quantity, 0);
        const totalPrice = req.session.cart.items.reduce((total, item) => total + (item.quantity * item.product.price), 0);

        const cart = {
            items: req.session.cart.items,
            totalQty: totalQty,
            totalPrice: totalPrice
        };

        res.render('orders/checkout', { cart });

    } catch (error) {
        console.error('Checkout error:', error);
        req.flash('error', 'Error loading checkout page');
        res.redirect('/cart');
    }
});

// Place order
router.post('/place-order', authRouter.isAuthenticated, async (req, res) => {
    try {
        console.log('Placing order - Session:', req.session); // Debug log
        console.log('Placing order - User:', req.session.user); // Debug log
        console.log('Placing order - Cart:', req.session.cart); // Debug log
        console.log('Placing order - Body:', req.body); // Debug log

        if (!req.session.cart || req.session.cart.items.length === 0) {
            console.log('Cart is empty'); // Debug log
            req.flash('error', 'Your cart is empty');
            return res.redirect('/cart');
        }

        const { address, phoneNumber } = req.body;
        const cart = req.session.cart;

        // Validate required fields
        if (!address || !phoneNumber) {
            console.log('Missing required fields:', { address, phoneNumber }); // Debug log
            req.flash('error', 'Please provide shipping address and phone number');
            return res.redirect('/orders/checkout');
        }

        // Validate user ID
        if (!req.session.user || !req.session.user._id) {
            console.log('No user ID found in session'); // Debug log
            req.flash('error', 'Please login to place an order');
            return res.redirect('/auth/login');
        }

        const order = new Order({
            user: req.session.user._id,
            items: cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            totalAmount: cart.totalPrice,
            shippingAddress: address,
            phoneNumber: phoneNumber,
            paymentMethod: 'cash'
        });

        console.log('Created order object:', order); // Debug log

        await order.save();
        console.log('Order saved successfully'); // Debug log

        // Clear the cart after successful order
        req.session.cart = {
            items: [],
            totalQty: 0,
            totalPrice: 0
        };

        req.flash('success', 'Order placed successfully');
        res.redirect('/orders/history');

    } catch (error) {
        console.error('Error placing order:', error); // Debug log
        req.flash('error', 'Error placing order: ' + error.message);
        res.redirect('/orders/checkout');
    }
});

// Order history
router.get('/history', authRouter.isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.session.user.id })
            .populate('items.product')
            .sort('-createdAt');

        res.render('orders/history', { orders });

    } catch (error) {
        console.error(error);
        req.flash('error', 'Error fetching order history');
        res.redirect('/');
    }
});

// Order details
router.get('/:orderId', authRouter.isAuthenticated, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            user: req.session.user.id
        }).populate('items.product');

        if (!order) {
            req.flash('error', 'Order not found');
            return res.redirect('/orders/history');
        }

        res.render('orders/details', { order });

    } catch (error) {
        console.error(error);
        req.flash('error', 'Error fetching order details');
        res.redirect('/orders/history');
    }
});

module.exports = router; 