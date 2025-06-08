const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { ensureAuth } = require('./middlewares/auth');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(session({ // SESSION must come BEFORE accessing req.session
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => { // Make currentUser available in all views
    res.locals.currentUser = req.session.user || null;
    next();
});



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', authRoutes);
app.use('/', productRoutes);
app.use('/', uploadRoutes);

// Home route
app.get('/', (req, res) => {
    const filters = {
        name: req.query.name || '',
        type: req.query.type || '',
        size: req.query.size || '',
        color: req.query.color || '',
        serial: req.query.serial || '',
        product_number: req.query.product_number || '',
        price: req.query.price || '',
        // add more if needed
    };

    let sql = 'SELECT * FROM products WHERE 1=1'; // base condition to append ANDs
    let params = [];

    if (filters.name) {
        sql += ' AND name LIKE ?';
        params.push(`%${filters.name}%`);
    }
    if (filters.type) {
        sql += ' AND type LIKE ?';
        params.push(`%${filters.type}%`);
    }
    if (filters.size) {
        sql += ' AND size LIKE ?';
        params.push(`%${filters.size}%`);
    }
    if (filters.color) {
        sql += ' AND color LIKE ?';
        params.push(`%${filters.color}%`);
    }
    if (filters.serial) {
        sql += ' AND serial LIKE ?';
        params.push(`%${filters.serial}%`);
    }
    if (filters.product_number) {
        sql += ' AND product_number LIKE ?';
        params.push(`%${filters.product_number}%`);
    }
    if (filters.price) {
        sql += ' AND price = ?'; // price exact match? Or use >= <= ? Adjust as needed
        params.push(filters.price);
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).send('Database error: ' + err.message);

        res.render('home', {
            currentUser: req.session.user || null,
            products: rows,
            filters
        });
    });
});



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});