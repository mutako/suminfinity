const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt'); // ensure you're using bcrypt

router.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('login', { error: null });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Modify the query to check both username and email
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], (err, user) => {
        if (err || !user) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        // Compare the entered password with the hashed password in the database
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.userId = user.id;
                req.session.user = user;
                res.redirect('/');
            } else {
                res.render('login', { error: 'Invalid credentials' });
            }
        });
    });
});

router.get('/register', (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('register', { error: null });
});

router.post('/register', (req, res) => {
    const { username, email, password, password2, phone, city } = req.body;

    console.log('POST /register body:', req.body); // TEMP: Debug log

    if (!username || !email || !password || !password2 || !city) {
        return res.render('register', { error: 'All fields except phone are required' });
    }

    if (password !== password2) {
        return res.render('register', { error: 'Passwords do not match' });
    }

    // Check if username or email already exists
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, existingUser) => {
        if (err) {
            return res.render('register', { error: 'Database error' });
        }

        if (existingUser) {
            return res.render('register', { error: 'Username or Email already exists' });
        }

        const hashed = bcrypt.hashSync(password, 10);
        db.run(
            `INSERT INTO users (username, email, password, phone, city, role) VALUES (?, ?, ?, ?, ?, ?)`, [username, email, hashed, phone || null, city, 'user'],
            function(err) {
                if (err) {
                    console.error('INSERT ERROR:', err);
                    return res.render('register', { error: 'Something went wrong during registration' });
                }

                req.session.userId = this.lastID;
                req.session.user = { id: this.lastID, username, email, role: 'user' };
                res.redirect('/');
            }
        );
    });
});




router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;