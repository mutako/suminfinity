const db = require('../config/db');

const createUser = (username, passwordHash, role = 'user', callback) => {
    const sql = `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`;
    db.run(sql, [username, passwordHash, role], function(err) {
        callback(err, this ? this.lastID : null);
    });
};

const getUserByUsername = (username, callback) => {
    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], (err, row) => {
        callback(err, row);
    });
};

const getUserById = (id, callback) => {
    const sql = `SELECT * FROM users WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
        callback(err, row);
    });
};

module.exports = {
    createUser,
    getUserByUsername,
    getUserById,
};