const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    console.log('Auth middleware - Session:', req.session); // Debug log
    if (req.session && req.session.user) {
        return next();
    }
    req.flash('error', 'Please login to continue');
    res.redirect('/auth/login');
};

// Login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/login');
});

// Register page
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/register');
});

// Login process
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email); // Debug log

        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        // Set session data
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        // Save session explicitly
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                req.flash('error', 'Error during login');
                return res.redirect('/auth/login');
            }
            
            console.log('Session after login:', req.session); // Debug log
            req.flash('success', 'Successfully logged in');
            
            // Redirect admin users to admin dashboard
            if (user.role === 'admin') {
                res.redirect('/admin');
            } else {
                res.redirect('/');
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login');
        res.redirect('/auth/login');
    }
});

// Register process
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/auth/register');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email already registered');
            return res.redirect('/auth/register');
        }

        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        req.flash('success', 'Registration successful. Please login');
        res.redirect('/auth/login');

    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred during registration');
        res.redirect('/auth/register');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// Admin login page
router.get('/admin/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/admin');
    }
    res.render('auth/admin-login');
});

// Admin login process
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.role !== 'admin') {
            req.flash('error', 'Access denied. Admins only.');
            return res.redirect('/auth/admin/login');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/admin/login');
        }

        // Set session data
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        // Save session explicitly
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                req.flash('error', 'Error during login');
                return res.redirect('/auth/admin/login');
            }
            
            req.flash('success', 'Admin login successful');
            res.redirect('/admin');
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred during admin login');
        res.redirect('/auth/admin/login');
    }
});

// Export both the router and isAuthenticated middleware
router.isAuthenticated = isAuthenticated;
module.exports = router; 