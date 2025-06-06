const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { requireLogin } = require('../middlewares/authMiddleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

function insertProducts(products, userId, redirectPath, res) {
    let count = 0,
        total = products.length;
    products.forEach(p => {
        db.run(`INSERT INTO products(user_id,type,size,color,serial,product_number,name,price,image)
            VALUES(?,?,?,?,?,?,?,?,?)`, [userId, p.type, p.size, p.color, p.serial, p.product_number, p.name, p.price, p.image],
            e => {
                count++;
                if (count === total) {
                    fs.unlinkSync(p.tmpfile);
                    res.redirect(redirectPath);
                }
            });
    });
}

router.get('/upload', requireLogin, (req, res) => { res.render('upload'); });

router.post('/upload', requireLogin, upload.single('image'), (req, res) => {
    req.file.name = ''; // optional
    req.session.flash = 'Single product uploaded';
    res.redirect('/products');
});

router.post('/upload-products', requireLogin, upload.single('file'), (req, res) => {
    if (!req.file) return res.redirect('/upload');
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fp = req.file.path;

    let products = [];
    if (ext === '.csv') {
        fs.createReadStream(fp).pipe(csvParser())
            .on('data', row => products.push({...row, tmpfile: fp }))
            .on('end', () => insertProducts(products, req.session.userId, '/products', res));
    } else {
        const wb = xlsx.readFile(fp);
        const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        rows.forEach(r => products.push({...r, tmpfile: fp }));
        insertProducts(products, req.session.userId, '/products', res);
    }
});

module.exports = router;