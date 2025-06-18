const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://sp23bai040:j7cb9VnP8qIazTR6@cluster0.tlbzrx4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(flash());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Global middleware for user session
app.use((req, res, next) => {
    console.log('Session middleware - Session:', req.session); // Debug log
    res.locals.user = req.session.user || null;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const complaintRoutes = require('./routes/complaints');

// Use routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/complaints', complaintRoutes);

// Home route
app.get('/', async (req, res) => {
    try {
        const products = await require('./models/Product').find().limit(6);
        res.render('crombie', { products });
    } catch (error) {
        console.error(error);
        res.render('crombie', { products: [] });
    }
});

// Error handling middleware
app.use((req, res, next) => {
    console.log('404 error for path:', req.path); // Debug log
    res.status(404).render('error', {
        message: 'Page not found',
        status: 404
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err); // Debug log
    res.status(err.status || 500).render('error', {
        message: err.message || 'Something went wrong!',
        status: err.status || 500
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});