const db = require('../config/db');

const createProduct = (product, callback) => {
    const {
        type,
        size,
        color,
        serial,
        product_number,
        name,
        price,
        image,
        user_id
    } = product;

    const sql = `INSERT INTO products
    (type, size, color, serial, product_number, name, price, image, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [type, size, color, serial, product_number, name, price, image, user_id], function(err) {
        callback(err, this ? this.lastID : null);
    });
};

const getAllProducts = (callback) => {
    const sql = `SELECT * FROM products`;
    db.all(sql, [], (err, rows) => {
        callback(err, rows);
    });
};

const getProductsByUserId = (userId, callback) => {
    const sql = `SELECT * FROM products WHERE user_id = ?`;
    db.all(sql, [userId], (err, rows) => {
        callback(err, rows);
    });
};

const getProductById = (id, callback) => {
    const sql = `SELECT * FROM products WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
        callback(err, row);
    });
};

const updateProduct = (id, product, callback) => {
    const {
        type,
        size,
        color,
        serial,
        product_number,
        name,
        price,
        image
    } = product;

    const sql = `UPDATE products SET
    type = ?, size = ?, color = ?, serial = ?, product_number = ?, 
    name = ?, price = ?, image = ?
    WHERE id = ?`;

    db.run(sql, [type, size, color, serial, product_number, name, price, image, id], function(err) {
        callback(err, this.changes);
    });
};

const deleteProduct = (id, callback) => {
    const sql = `DELETE FROM products WHERE id = ?`;
    db.run(sql, [id], function(err) {
        callback(err, this.changes);
    });
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductsByUserId,
    getProductById,
    updateProduct,
    deleteProduct,
};