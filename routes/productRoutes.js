const express = require('express');
const path = require('path');
const db = require('../config/db');
const { requireLogin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', (req, res) => res.redirect('/products'));

router.get('/products', requireLogin, (req, res) => {
    let q = req.query.search || '';
    const sql = `
    SELECT p.*, u.username FROM products p
    JOIN users u ON p.user_id=u.id
    WHERE name LIKE ? OR type LIKE ? OR size LIKE ? OR color LIKE ?
    ORDER BY id DESC
  `;
    db.all(sql, Array(4).fill(`%${q}%`), (e, rows) => {
        res.render('products/index', { products: rows, userId: req.session.userId, search: q });
    });
});

router.get('/products/my', requireLogin, (req, res) => {
    const uid = req.session.userId;
    db.all('SELECT * FROM products WHERE user_id=?', [uid], (e, rows) => {
        res.render('products/myProducts', { products: rows, userId: uid });
    });
});

router.get('/products/create', requireLogin, (req, res) => {
    res.render('products/create', { error: null });
});

router.post('/products/create', requireLogin, (req, res) => {
    const { type, size, color, serial, product_number, name, price } = req.body;
    const img = req.file ? req.file.filename : null;
    const uid = req.session.userId;
    db.run(
        `INSERT INTO products (user_id,type,size,color,serial,product_number,name,price,image)
     VALUES(?,?,?,?,?,?,?,?,?)`, [uid, type, size, color, serial, product_number, name, price, img],
        (e) => e ? res.render('products/create', { error: 'Error saving' }) :
        res.redirect('/products'));
});

router.get('/products/edit/:id', requireLogin, (req, res) => {
    db.get('SELECT * FROM products WHERE id=?', [req.params.id], (e, row) => {
        if (!row || row.user_id !== req.session.userId) return res.status(403).send('Forbidden');
        res.render('products/edit', { product: row, error: null });
    });
});

router.post('/products/edit/:id', requireLogin, (req, res) => {
    const { id } = req.params;
    const { type, size, color, serial, product_number, name, price } = req.body;
    const img = req.file ? req.file.filename : null;

    db.get('SELECT image FROM products WHERE id=?', [id], (e, row) => {
        if (row.image && img) {
            const old = path.join(__dirname, '..', 'uploads', row.image);
            require('fs').unlink(old, () => {});
        }
        const sql = `UPDATE products SET type=?,size=?,color=?,serial=?,product_number=?,name=?,price=?,image=?
                 WHERE id=? AND user_id=?`;
        db.run(sql, [type, size, color, serial, product_number, name, price, img || row.image, id, req.session.userId],
            (e) => e ? res.status(500).send('Error') : res.redirect('/products/my'));
    });
});

router.get('/products/delete/:id', requireLogin, (req, res) => {
    db.get('SELECT image FROM products WHERE id=?', [req.params.id], (e, row) => {
        if (row.image) require('fs').unlink(path.join(__dirname, '..', 'uploads', row.image), () => {});
        db.run('DELETE FROM products WHERE id=? AND user_id=?', [req.params.id, req.session.userId], () => {
            res.redirect('/products/my');
        });
    });
});

module.exports = router;