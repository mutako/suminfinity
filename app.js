const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
    secret: 'your-secret',
    resave: false,
    saveUninitialized: false
}));

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const exportRoutes = require('./routes/exportRoutes');

app.use(authRoutes);
app.use(productRoutes);
app.use(uploadRoutes);
app.use(exportRoutes);

app.listen(3000, () => console.log('Running at http://localhost:3000'));