const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csvParser = require('csv-parser');
const xlsx = require('xlsx');
const db = require('../config/db');
const { requireLogin } = require('../middlewares/auth');

// Configure Multer to preserve file extensions
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/uploads'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Get the file extension
        const filename = `${Date.now()}${ext}`; // Create a unique filename with the extension
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

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
                // Validate required fields
                if (!product.type || !product.size || !product.color || !product.name || !product.price) {
                    throw new Error(`Missing required fields for product: ${JSON.stringify(product)}`);
                }

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
                if (!row.type || !row.size || !row.color || !row.name || !row.price) {
                    throw new Error('Uploaded file is missing required columns.');
                }
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
                console.log('Parsed products:', products);
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
                const missingColumns = [];
                if (!row.type) missingColumns.push('type');
                if (!row.size) missingColumns.push('size');
                if (!row.color) missingColumns.push('color');
                if (!row.name) missingColumns.push('name');
                if (!row.price) missingColumns.push('price');

                if (missingColumns.length > 0) {
                    throw new Error(`Uploaded file is missing required columns: ${missingColumns.join(', ')}`);
                }

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

            console.log('Parsed products:', products); // Debug log
            insertProducts(products, userId, res);
        } catch (err) {
            res.status(500).send('Error parsing XLSX file: ' + err.message);
        }
    } else {
        res.status(400).send('Invalid file type. Please upload a CSV or XLSX file.');
    }
});

router.post('/add-product', requireLogin, upload.single('image'), (req, res) => {
    const { type, size, color, serial, product_number, name, price, image_url } = req.body;
    const userId = req.session.userId;

    if (!type || !size || !color || !name || !price) {
        return res.status(400).send('All required fields must be filled.');
    }

    // Use the uploaded image if provided, otherwise use the image URL
    const imagePath = req.file ? `/uploads/${req.file.filename}` : image_url || null;

    db.run(
        `INSERT INTO products (type, size, color, serial, product_number, name, price, image, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [type, size, color, serial || null, product_number || null, name, parseFloat(price), imagePath, userId],
        function(err) {
            if (err) {
                return res.status(500).send('Error adding product: ' + err.message);
            }
            res.redirect('/products/my');
        }
    );
});

module.exports = router;