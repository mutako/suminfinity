const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const { requireLogin } = require('../middlewares/auth');
const { deleteFile, generateFilename } = require('../utils/helpers');

const upload = multer({
    dest: path.join(__dirname, '..', 'public', 'uploads')
});

// View all products
router.get('/products', (req, res) => {
    const filters = req.query;
    const whereClauses = [];
    const params = [];

    if (filters.name) {
        whereClauses.push('name LIKE ?');
        params.push(`%${filters.name}%`);
    }
    if (filters.type) {
        whereClauses.push('type LIKE ?');
        params.push(`%${filters.type}%`);
    }
    if (filters.size) {
        whereClauses.push('size LIKE ?');
        params.push(`%${filters.size}%`);
    }
    if (filters.color) {
        whereClauses.push('color LIKE ?');
        params.push(`%${filters.color}%`);
    }
    if (filters.serial) {
        whereClauses.push('serial LIKE ?');
        params.push(`%${filters.serial}%`);
    }
    if (filters.product_number) {
        whereClauses.push('product_number LIKE ?');
        params.push(`%${filters.product_number}%`);
    }
    if (filters.min_price) {
        whereClauses.push('price >= ?');
        params.push(filters.min_price);
    }
    if (filters.max_price) {
        whereClauses.push('price <= ?');
        params.push(filters.max_price);
    }

    const whereSQL = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';
    const sql = `SELECT * FROM products ${whereSQL} ORDER BY id DESC`;

    db.all(sql, params, (err, products) => {
        if (err) {
            console.error(err);
            return res.render('home', { products: [], filters, error: 'Failed to load products' });
        }
        res.render('home', { products, filters });
    });
});


// View my products
router.get('/products/my', requireLogin, (req, res) => {
    db.all('SELECT * FROM products WHERE user_id = ?', [req.session.userId], (err, products) => {
        if (err) return res.send('Error loading products');
        res.render('myProducts', { products, user: req.session.user });
    });
});

// Upload product form
router.get('/upload', requireLogin, (req, res) => {
    res.render('uploadForm', { user: req.session.user });
});

// Upload single product
router.post('/upload', requireLogin, upload.single('image'), (req, res) => {
    const { type, size, color, serial, product_number, name, price } = req.body;
    const image = req.file ? req.file.filename : null;

    db.run(`
        INSERT INTO products (type, size, color, serial, product_number, name, price, image, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [type, size, color, serial, product_number, name, price, image, req.session.userId], (err) => {
        if (err) return res.send('Error uploading product');
        res.redirect('/products/my');
    });
});

// Edit product form
router.get('/edit-product/:id', requireLogin, (req, res) => {
    db.get('SELECT * FROM products WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId], (err, product) => {
        if (err || !product) return res.send('Product not found');
        res.render('editProduct', { product, user: req.session.user });
    });
});

// Update product
router.post('/edit-product/:id', requireLogin, upload.single('image'), (req, res) => {
    const id = req.params.id;
    const { type, size, color, serial, product_number, name, price } = req.body;

    db.get('SELECT image FROM products WHERE id = ? AND user_id = ?', [id, req.session.userId], (err, product) => {
        if (!product) return res.send('Product not found');
        const newImage = req.file ? req.file.filename : product.image;
        if (req.file && product.image) deleteFile(path.join(__dirname, '..', 'public', 'uploads', product.image));

        db.run(`
            UPDATE products SET type = ?, size = ?, color = ?, serial = ?, product_number = ?, name = ?, price = ?, image = ?
            WHERE id = ? AND user_id = ?
        `, [type, size, color, serial, product_number, name, price, newImage, id, req.session.userId], (err) => {
            if (err) return res.send('Error updating product');
            res.redirect('/products/my');
        });
    });
});

// Delete product
router.get('/delete-product/:id', requireLogin, (req, res) => {
    const id = req.params.id;
    db.get('SELECT image FROM products WHERE id = ? AND user_id = ?', [id, req.session.userId], (err, product) => {
        if (!product) return res.send('Product not found');
        if (product.image) deleteFile(path.join(__dirname, '..', 'public', 'uploads', product.image));

        db.run('DELETE FROM products WHERE id = ? AND user_id = ?', [id, req.session.userId], (err) => {
            if (err) return res.send('Error deleting product');
            res.redirect('/products/my');
        });
    });
});

module.exports = router;