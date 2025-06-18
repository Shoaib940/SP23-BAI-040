const express = require('express');
const router = express.Router();
const authRouter = require('./auth');
const Product = require('../models/Product');

// Initialize cart in session if it doesn't exist
const initCart = (req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = {
            items: [],
            totalQty: 0,
            totalPrice: 0
        };
    }
    next();
};

// View cart
router.get('/', authRouter.isAuthenticated, initCart, (req, res) => {
    res.render('cart/index', {
        cart: req.session.cart
    });
});

// Add to cart
router.post('/add/:productId', authRouter.isAuthenticated, initCart, async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);
        
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('back');
        }

        const cart = req.session.cart;
        const existingItem = cart.items.find(item => item.product._id.toString() === productId);

        if (existingItem) {
            existingItem.quantity += 1;
            existingItem.total = existingItem.quantity * existingItem.product.price;
        } else {
            cart.items.push({
                product: {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl
                },
                quantity: 1,
                total: product.price
            });
        }

        // Recalculate totals
        cart.totalQty = cart.items.reduce((total, item) => total + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.quantity * item.product.price), 0);

        req.flash('success', 'Product added to cart');
        res.redirect('back');

    } catch (error) {
        console.error(error);
        req.flash('error', 'Error adding product to cart');
        res.redirect('back');
    }
});

// Update cart item quantity
router.post('/update/:productId', authRouter.isAuthenticated, initCart, async (req, res) => {
    try {
        const productId = req.params.productId;
        const quantity = parseInt(req.body.quantity);
        const cart = req.session.cart;

        if (quantity <= 0) {
            cart.items = cart.items.filter(item => item.product._id.toString() !== productId);
        } else {
            const item = cart.items.find(item => item.product._id.toString() === productId);
            if (item) {
                item.quantity = quantity;
                item.total = quantity * item.product.price;
            }
        }

        cart.totalQty = cart.items.reduce((total, item) => total + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((total, item) => total + item.total, 0);

        req.flash('success', 'Cart updated');
        res.redirect('/cart');

    } catch (error) {
        console.error(error);
        req.flash('error', 'Error updating cart');
        res.redirect('/cart');
    }
});

// Remove item from cart
router.post('/remove/:productId', authRouter.isAuthenticated, initCart, (req, res) => {
    try {
        const productId = req.params.productId;
        const cart = req.session.cart;

        cart.items = cart.items.filter(item => item.product._id.toString() !== productId);
        cart.totalQty = cart.items.reduce((total, item) => total + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((total, item) => total + item.total, 0);

        req.flash('success', 'Item removed from cart');
        res.redirect('/cart');

    } catch (error) {
        console.error(error);
        req.flash('error', 'Error removing item from cart');
        res.redirect('/cart');
    }
});

// Clear cart
router.post('/clear', authRouter.isAuthenticated, initCart, (req, res) => {
    req.session.cart = {
        items: [],
        totalQty: 0,
        totalPrice: 0
    };
    req.flash('success', 'Cart cleared');
    res.redirect('/cart');
});

module.exports = router; 