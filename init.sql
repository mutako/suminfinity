-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    serial TEXT,
    product_number TEXT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Optional: Insert sample user (password is "password" hashed with bcrypt)
INSERT INTO users (username, email, password, role) VALUES (
    'admin', 'admin@example.com', '$2b$10$z/z7KQ2vVru2xOmBMyTeEuKP6IoLzFMqp.Zcz26CkBKrUbHRPT7Cm', 'admin'
);

-- Optional: Insert sample product tied to admin
INSERT INTO products (user_id, type, size, color, serial, product_number, name, price, image) VALUES (
    1, 'Shirt', 'M', 'Blue', 'S12345', 'P001', 'Cool Shirt', 19.99, 'default.jpg'
);
