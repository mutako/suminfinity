const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csvParser = require('csv-parser');
const xlsx = require('xlsx');
const db = require('../config/db');
const { requireLogin } = require('../middlewares/auth');

const upload = multer({ dest: path.join(__dirname, '../public/uploads/') });

// Helper function to insert many products into the database
function insertProducts(products, userId, res) {
    const stmt = db.prepare(`
    INSERT INTO products (type, size, color, serial, product_number, name, price, image, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        try {
            products.forEach(product => {
                stmt.run(
                    product.type,
                    product.size,
                    product.color,
                    product.serial || null,
                    product.product_number || null,
                    product.name,
                    product.price,
                    product.image || null,
                    userId
                );
            });
            db.run('COMMIT');
            res.redirect('/products/my');
        } catch (err) {
            db.run('ROLLBACK');
            res.status(500).send('Error inserting products: ' + err.message);
        }
    });
}

// Render upload CSV/XLSX form
router.get('/upload-products', requireLogin, (req, res) => {
    res.render('uploadForm', { user: req.session.username });
});

// Handle CSV/XLSX upload
router.post('/upload-products', requireLogin, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = path.join(__dirname, '..', 'public', 'uploads', req.file.filename);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    const userId = req.session.userId;
    let products = [];

    if (fileExtension === '.csv') {
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                products.push({
                    type: row.type,
                    size: row.size,
                    color: row.color,
                    serial: row.serial,
                    product_number: row.product_number,
                    name: row.name,
                    price: parseFloat(row.price),
                    image: null,
                });
            })
            .on('end', () => {
                insertProducts(products, userId, res);
            })
            .on('error', (err) => {
                res.status(500).send('Error parsing CSV file: ' + err.message);
            });
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        try {
            const workbook = xlsx.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = xlsx.utils.sheet_to_json(sheet);

            rows.forEach(row => {
                products.push({
                    type: row.type,
                    size: row.size,
                    color: row.color,
                    serial: row.serial,
                    product_number: row.product_number,
                    name: row.name,
                    price: parseFloat(row.price),
                    image: null,
                });
            });

            insertProducts(products, userId, res);
        } catch (err) {
            res.status(500).send('Error parsing XLSX file: ' + err.message);
        }
    } else {
        res.status(400).send('Invalid file type. Please upload a CSV or XLSX file.');
    }
});

module.exports = router;