const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const router = express.Router();

// prevent logged-in access
function redirectHome(req, res, next) {
    if (req.session.userId) return res.redirect('/products');
    next();
}

router.get('/register', redirectHome, (req, res) => {
    res.render('register', { error: null });
});

router.post('/register', async(req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password_hash) VALUES (?,?)', [username, hash],
        (err) => {
            if (err) return res.render('register', { error: 'Username taken' });
            res.redirect('/login');
        });
});

router.get('/login', redirectHome, (req, res) => {
    res.render('login', { error: null });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username=?', [username], async(err, user) => {
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.render('login', { error: 'Invalid credentials' });
        }
        req.session.userId = user.id;
        req.session.role = user.role;
        res.redirect('/products');
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;