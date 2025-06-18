const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// Configure Cloudinary with detailed logging
console.log('Configuring Cloudinary...');
try {
    cloudinary.config({
        cloud_name: 'dna3zaknx',
        api_key: '487871718177984',
        api_secret: "hgBG7g8e5Vy8eeuLjJ1pE63tZu4"
    });
    console.log('Cloudinary configuration successful');
} catch (error) {
    console.error('Error configuring Cloudinary:', error);
}

// Verify Cloudinary configuration
try {
    console.log('Verifying Cloudinary configuration...');
    console.log('Cloud name:', cloudinary.config().cloud_name);
    console.log('API Key:', cloudinary.config().api_key);
    console.log('API Secret exists:', !!cloudinary.config().api_secret);
} catch (error) {
    console.error('Error verifying Cloudinary configuration:', error);
}

// Configure Cloudinary storage with error handling
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'crombie-products',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

// Configure multer with error handling
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).single('image');

// Admin middleware to check role
const isAdmin = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'Please login first');
        return res.redirect('/auth/admin/login');
    }
    
    if (req.session.user.role !== 'admin') {
        req.flash('error', 'Access denied. Admin only.');
        return res.redirect('/auth/admin/login');
    }
    
    next();
};

// Apply admin middleware to all routes
router.use(isAdmin);

// Admin dashboard
router.get('/', async (req, res) => {
    try {
        // Get counts from MongoDB
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalCustomers = await User.countDocuments({ role: 'user' });
        const totalComplaints = await Complaint.countDocuments();

        res.render('admin/dashboard', {
            admin: req.session.user,
            messages: {
                error: req.flash('error'),
                success: req.flash('success')
            },
            stats: {
                totalProducts,
                totalOrders,
                totalCustomers,
                totalComplaints
            },
            layout: 'admin/admin-layout'
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.render('admin/dashboard', {
            admin: req.session.user,
            messages: {
                error: 'Failed to load dashboard statistics',
                success: req.flash('success')
            },
            stats: {
                totalProducts: 0,
                totalOrders: 0,
                totalCustomers: 0,
                totalComplaints: 0
            },
            layout: 'admin/admin-layout'
        });
    }
});

// View all orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product')
            .sort('-createdAt');
        
        res.render('admin/orders', {
            orders,
            admin: req.session.user,
            messages: {
                error: req.flash('error'),
                success: req.flash('success')
            },
            layout: 'admin/admin-layout'
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        req.flash('error', 'Failed to fetch orders');
        res.redirect('/admin');
    }
});

// Add product form
router.get('/products/new', (req, res) => {
    res.render('admin/add-product', {
        admin: req.session.user,
        messages: {
            error: req.flash('error'),
            success: req.flash('success')
        },
        layout: 'admin/admin-layout'
    });
});

// Handle add product with custom upload handling
router.post('/products/new', (req, res) => {
    upload(req, res, async function(uploadError) {
        try {
            console.log('Starting product upload process...');
            
            // Check for multer/upload errors
            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw new Error(`File upload failed: ${uploadError.message}`);
            }

            console.log('Form data received:', req.body);
            console.log('File data received:', req.file);

            const { name, description, price, category } = req.body;

            // Validate required fields
            if (!name || !description || !price || !category) {
                throw new Error('All fields are required');
            }

            // Validate price
            const parsedPrice = parseFloat(price);
            if (isNaN(parsedPrice) || parsedPrice <= 0) {
                throw new Error('Invalid price value');
            }

            // Check if image was uploaded
            if (!req.file) {
                throw new Error('Product image is required');
            }

            console.log('Creating new product...');
            const product = new Product({
                name,
                description,
                price: parsedPrice,
                category,
                imageUrl: req.file.path,
                inStock: true
            });

            console.log('Saving product to database...');
            await product.save();
            console.log('Product saved successfully:', product);

            req.flash('success', 'Product added successfully');
            res.redirect('/admin/products/new');
        } catch (error) {
            console.error('Error in product upload process:', error);
            
            // If there was an error and an image was uploaded, try to delete it
            if (req.file && req.file.path) {
                try {
                    console.log('Attempting to delete uploaded image...');
                    const publicId = req.file.filename;
                    await cloudinary.uploader.destroy(publicId);
                    console.log('Image deleted successfully');
                } catch (deleteError) {
                    console.error('Error deleting uploaded image:', deleteError);
                }
            }

            req.flash('error', error.message || 'Failed to add product');
            res.redirect('/admin/products/new');
        }
    });
});

// Update order status
router.post('/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await Order.findByIdAndUpdate(req.params.id, { status });
        req.flash('success', 'Order status updated successfully');
        res.redirect('/admin/orders');
    } catch (error) {
        console.error('Error updating order status:', error);
        req.flash('error', 'Failed to update order status');
        res.redirect('/admin/orders');
    }
});

// Admin: List all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort('-createdAt');
        res.render('admin/products', {
            products,
            admin: req.session.user,
            messages: {
                error: req.flash('error'),
                success: req.flash('success')
            },
            layout: 'admin/admin-layout'
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        req.flash('error', 'Failed to fetch products');
        res.redirect('/admin');
    }
});

// Admin: Edit product form
router.get('/products/:id/edit', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/admin/products');
        }
        res.render('admin/edit-product', {
            product,
            admin: req.session.user,
            messages: {
                error: req.flash('error'),
                success: req.flash('success')
            },
            layout: 'admin/admin-layout'
        });
    } catch (error) {
        console.error('Error loading product for edit:', error);
        req.flash('error', 'Failed to load product');
        res.redirect('/admin/products');
    }
});

// Admin: Handle edit product
router.post('/products/:id/edit', (req, res) => {
    upload(req, res, async function(uploadError) {
        try {
            if (uploadError) {
                throw new Error(`File upload failed: ${uploadError.message}`);
            }
            const { name, description, price, category } = req.body;
            const updateData = { name, description, price, category };
            if (req.file) {
                updateData.imageUrl = req.file.path;
            }
            await Product.findByIdAndUpdate(req.params.id, updateData);
            req.flash('success', 'Product updated successfully');
            res.redirect('/admin/products');
        } catch (error) {
            console.error('Error updating product:', error);
            req.flash('error', error.message || 'Failed to update product');
            res.redirect(`/admin/products/${req.params.id}/edit`);
        }
    });
});

// Admin: Delete product
router.post('/products/:id/delete', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        req.flash('success', 'Product deleted successfully');
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Error deleting product:', error);
        req.flash('error', 'Failed to delete product');
        res.redirect('/admin/products');
    }
});

// View all complaints
router.get('/complaints', async (req, res) => {
    try {
        console.log('Accessing admin complaints route'); // Debug log
        console.log('Session user:', req.session.user); // Debug log
        
        if (!req.session.user || req.session.user.role !== 'admin') {
            console.log('User not authenticated or not admin'); // Debug log
            req.flash('error', 'Access denied. Admin only.');
            return res.redirect('/auth/admin/login');
        }

        const complaints = await Complaint.find()
            .populate('user', 'name email')
            .populate('order')
            .sort('-createdAt');
        
        console.log('Found complaints:', complaints.length); // Debug log
        
        res.render('admin/complaints', {
            complaints,
            admin: req.session.user,
            messages: {
                error: req.flash('error'),
                success: req.flash('success')
            },
            layout: 'admin/admin-layout'
        });
    } catch (error) {
        console.error('Error in admin complaints route:', error); // Debug log
        req.flash('error', 'Failed to fetch complaints');
        res.redirect('/admin');
    }
});

// Update complaint status and response
router.post('/complaints/:id/update', async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const complaint = await Complaint.findById(req.params.id);
        
        if (!complaint) {
            req.flash('error', 'Complaint not found');
            return res.redirect('/admin/complaints');
        }

        complaint.status = status;
        complaint.adminResponse = adminResponse;
        await complaint.save();

        req.flash('success', 'Complaint updated successfully');
        res.redirect('/admin/complaints');
    } catch (error) {
        console.error('Error updating complaint:', error);
        req.flash('error', 'Failed to update complaint');
        res.redirect('/admin/complaints');
    }
});

module.exports = router; 