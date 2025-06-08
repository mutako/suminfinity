function requireLogin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

function requireAdmin(req, res, next) {
    if (req.session.role !== 'admin') {
        return res.status(403).send('Access denied. Admins only.');
    }
    next();
}

function preventLoggedInAccess(req, res, next) {
    if (req.session && req.session.userId) {
        return res.redirect('/');
    }
    next();
}

// ✅ Export as an object
module.exports = {
    requireLogin,
    requireAdmin,
    preventLoggedInAccess
};