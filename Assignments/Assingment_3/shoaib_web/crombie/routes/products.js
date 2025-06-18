const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('products/index', { products });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error fetching products');
        res.redirect('/');
    }
});

// Get product details
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/products');
        }
        res.render('products/details', { product });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error fetching product details');
        res.redirect('/products');
    }
});

// For testing: Add sample products
router.get('/seed/test-data', async (req, res) => {
    try {
        const sampleProducts = [
            {
                name: 'Classic Overcoat',
                description: 'A timeless classic overcoat perfect for any occasion',
                price: 599.99,
                image: '/images/coat.png',
                category: 'Coats'
            },
            {
                name: 'Wool Blend Coat',
                description: 'Luxurious wool blend coat for ultimate comfort',
                price: 499.99,
                image: '/images/wool.png',
                category: 'Coats'
            },
            {
                name: 'Herringbone Coat',
                description: 'Sophisticated herringbone pattern coat',
                price: 649.99,
                image: '/images/3caot.png',
                category: 'Coats'
            }
        ];

        await Product.insertMany(sampleProducts);
        req.flash('success', 'Sample products added successfully');
        res.redirect('/products');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error adding sample products');
        res.redirect('/products');
    }
});

module.exports = router; 