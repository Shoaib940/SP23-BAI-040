// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    console.log('Auth middleware - Session:', req.session); // Debug log
    if (req.session && req.session.user) {
        next();
    } else {
        console.log('Auth middleware - User not authenticated'); // Debug log
        req.flash('error', 'Please login to access this page');
        res.redirect('/auth/login');
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    console.log('Admin middleware - Session:', req.session); // Debug log
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        console.log('Admin middleware - Access denied'); // Debug log
        req.flash('error', 'Access denied. Admin only.');
        res.redirect('/auth/admin/login');
    }
};

module.exports = {
    isAuthenticated,
    isAdmin
}; 