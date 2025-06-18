const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Order = require('../models/Order');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Get complaint form
router.get('/', isAuthenticated, async (req, res) => {
    try {
        console.log('Session:', req.session); // Debug log
        console.log('Session user:', req.session.user); // Debug log
        console.log('User ID:', req.session.user._id); // Debug log
        
        if (!req.session.user || !req.session.user._id) {
            console.log('No user ID found in session'); // Debug log
            req.flash('error', 'Please login to access this page');
            return res.redirect('/auth/login');
        }

        const orders = await Order.find({ user: req.session.user._id })
            .sort({ createdAt: -1 })
            .limit(5);
        console.log('Found orders:', orders.length); // Debug log
        
        res.render('complaints/form', { 
            orders,
            user: req.session.user // Pass user to template
        });
    } catch (error) {
        console.error('Error in complaints route:', error); // Debug log
        req.flash('error', 'Error loading complaint form');
        res.redirect('/');
    }
});

// Submit complaint
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { orderId, message } = req.body;
        console.log('Submitting complaint:', { orderId, message }); // Debug log
        
        if (!req.session.user || !req.session.user._id) {
            console.log('No user ID found in session'); // Debug log
            req.flash('error', 'Please login to access this page');
            return res.redirect('/auth/login');
        }
        
        // Validate order exists and belongs to user
        let order = null;
        if (orderId) {
            order = await Order.findOne({ _id: orderId, user: req.session.user._id });
            if (!order) {
                req.flash('error', 'Invalid order selected');
                return res.redirect('/complaints');
            }
        }

        const complaint = new Complaint({
            user: req.session.user._id,
            order: order ? order._id : null,
            message,
            status: 'pending'
        });

        await complaint.save();
        req.flash('success', 'Complaint submitted successfully');
        res.redirect('/complaints/list');
    } catch (error) {
        console.error('Error submitting complaint:', error);
        req.flash('error', 'Error submitting complaint');
        res.redirect('/complaints');
    }
});

// Get user's complaints
router.get('/list', isAuthenticated, async (req, res) => {
    try {
        if (!req.session.user || !req.session.user._id) {
            console.log('No user ID found in session'); // Debug log
            req.flash('error', 'Please login to access this page');
            return res.redirect('/auth/login');
        }

        const complaints = await Complaint.find({ user: req.session.user._id })
            .populate('order')
            .sort({ createdAt: -1 });
        res.render('complaints/list', { 
            complaints, 
            isAdmin: false,
            user: req.session.user // Pass user to template
        });
    } catch (error) {
        console.error('Error fetching user complaints:', error);
        req.flash('error', 'Error loading complaints');
        res.redirect('/');
    }
});

// Admin routes
router.get('/admin', isAdmin, async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('user', 'name email')
            .populate('order')
            .sort({ createdAt: -1 });
        res.render('complaints/list', { 
            complaints, 
            isAdmin: true,
            user: req.session.user // Pass user to template
        });
    } catch (error) {
        console.error('Error fetching admin complaints:', error);
        req.flash('error', 'Error loading complaints');
        res.redirect('/admin');
    }
});

// Update complaint status and response
router.post('/admin/update/:id', isAdmin, async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const complaint = await Complaint.findById(req.params.id);
        
        if (!complaint) {
            req.flash('error', 'Complaint not found');
            return res.redirect('/complaints/admin');
        }

        complaint.status = status;
        complaint.adminResponse = adminResponse;
        await complaint.save();

        req.flash('success', 'Complaint updated successfully');
        res.redirect('/complaints/admin');
    } catch (error) {
        console.error('Error updating complaint:', error);
        req.flash('error', 'Error updating complaint');
        res.redirect('/complaints/admin');
    }
});

module.exports = router; 