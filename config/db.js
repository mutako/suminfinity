const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '..', 'database.sqlite'));

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    role TEXT DEFAULT 'user'
  )`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type, size, color, serial, product_number, name, price,
    image TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});
module.exports = db;