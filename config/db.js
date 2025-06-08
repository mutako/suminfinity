const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to the database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      city TEXT,
      role TEXT DEFAULT 'user'
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      size TEXT NOT NULL,
      color TEXT NOT NULL,
      serial TEXT,
      product_number TEXT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
});

module.exports = db;