const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log('--- GREENSOFT SYSTEM STARTING ---');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let pool = null;

// Database Configuration
const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Function to Ensure Tables Exist
async function ensureTables() {
    try {
        if (!pool) pool = mysql.createPool(dbConfig);
        const conn = await pool.getConnection();
        console.log('Migrating Database Tables...');

        await conn.query(`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            businessName VARCHAR(255), 
            fullName VARCHAR(255), 
            phoneNumber VARCHAR(20), 
            email VARCHAR(255) UNIQUE, 
            password VARCHAR(255), 
            logo TEXT, 
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS inventory (
            id VARCHAR(255) PRIMARY KEY, 
            name VARCHAR(255), 
            category VARCHAR(255), 
            sku VARCHAR(255), 
            quantity INT DEFAULT 0, 
            unit VARCHAR(50), 
            purchasePrice DECIMAL(10,2) DEFAULT 0, 
            sellingPrice DECIMAL(10,2) DEFAULT 0, 
            minStock INT DEFAULT 0, 
            supplier VARCHAR(255), 
            lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS sales (
            id VARCHAR(255) PRIMARY KEY, 
            invoiceNo VARCHAR(255), 
            customerName VARCHAR(255), 
            date DATETIME, 
            totalAmount DECIMAL(10,2) DEFAULT 0, 
            paidAmount DECIMAL(10,2) DEFAULT 0, 
            paymentMethod VARCHAR(50), 
            status VARCHAR(50), 
            items JSON
        )`);

        conn.release();
        console.log('>>> ALL TABLES VERIFIED AND READY <<<');
        return true;
    } catch (err) {
        console.error('Migration Error:', err.message);
        return false;
    }
}

// Diagnostic API
app.get('/api/db-init', async (req, res) => {
    const success = await ensureTables();
    if (success) res.json({ message: 'Tables initialized successfully' });
    else res.status(500).json({ error: 'Failed to initialize tables' });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', db: !!pool }));

// Registration
app.post('/api/auth/register', async (req, res) => {
    try {
        if (!pool) await ensureTables();
        const { businessName, fullName, phoneNumber, email, password } = req.body;
        
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email already registered.' });
        
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (businessName, fullName, phoneNumber, email, password) VALUES (?, ?, ?, ?, ?)',
            [businessName, fullName, phoneNumber, email, hashed]
        );
        res.status(201).json({ success: true, user: { id: result.insertId, email, businessName } });
    } catch (err) {
        console.error('Reg Error:', err.message);
        res.status(500).json({ error: 'Database Error: ' + err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        if (!pool) await ensureTables();
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'User not found.' });
        
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid password.' });
        
        res.json({ success: true, user: { id: user.id, email: user.email, businessName: user.businessName, name: user.fullName } });
    } catch (err) {
        res.status(500).json({ error: 'Database Error: ' + err.message });
    }
});

// APIs
app.get('/api/inventory', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM inventory');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Production serving
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    ensureTables(); // Run migration on start
});
