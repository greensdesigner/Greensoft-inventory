const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log('--- GREENSOFT SYSTEM BOOTING ---');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let pool = null;

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

async function ensureAllTables() {
    try {
        if (!pool) pool = mysql.createPool(dbConfig);
        const conn = await pool.getConnection();
        
        console.log('Synchronizing database schema with backticks...');

        // Users
        await conn.query(`CREATE TABLE IF NOT EXISTS \`users\` (id INT AUTO_INCREMENT PRIMARY KEY, businessName VARCHAR(255), fullName VARCHAR(255), phoneNumber VARCHAR(20), email VARCHAR(255) UNIQUE, password VARCHAR(255), logo TEXT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        
        // Inventory
        await conn.query(`CREATE TABLE IF NOT EXISTS \`inventory\` (id VARCHAR(255) PRIMARY KEY, \`name\` VARCHAR(255), \`category\` VARCHAR(255), \`sku\` VARCHAR(255), \`quantity\` INT DEFAULT 0, \`unit\` VARCHAR(50), \`purchasePrice\` DECIMAL(10,2) DEFAULT 0, \`sellingPrice\` DECIMAL(10,2) DEFAULT 0, \`minStock\` INT DEFAULT 0, \`supplier\` VARCHAR(255), \`lastUpdated\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
        
        // Sales
        await conn.query(`CREATE TABLE IF NOT EXISTS \`sales\` (id VARCHAR(255) PRIMARY KEY, \`invoiceNo\` VARCHAR(255), \`customerName\` VARCHAR(255), \`customerPhone\` VARCHAR(255), \`customerEmail\` VARCHAR(255), \`customerAddress\` TEXT, \`items\` JSON, \`total\` DECIMAL(10,2) DEFAULT 0, \`paid\` DECIMAL(10,2) DEFAULT 0, \`date\` VARCHAR(50), \`paymentMethod\` VARCHAR(50), \`status\` VARCHAR(50))`);
        
        // Suppliers
        await conn.query(`CREATE TABLE IF NOT EXISTS \`suppliers\` (id VARCHAR(255) PRIMARY KEY, \`name\` VARCHAR(255), \`contactPerson\` VARCHAR(255), \`phone\` VARCHAR(20), \`email\` VARCHAR(255), \`address\` TEXT, \`category\` VARCHAR(255), \`status\` VARCHAR(50))`);

        // Customers
        await conn.query(`CREATE TABLE IF NOT EXISTS \`customers\` (id VARCHAR(255) PRIMARY KEY, \`name\` VARCHAR(255), \`phone\` VARCHAR(20), \`email\` VARCHAR(255), \`address\` TEXT, \`totalOrders\` INT DEFAULT 0, \`totalSpent\` DECIMAL(10,2) DEFAULT 0)`);

        // Expenses
        await conn.query(`CREATE TABLE IF NOT EXISTS \`expenses\` (id VARCHAR(255) PRIMARY KEY, \`title\` VARCHAR(255), \`category\` VARCHAR(255), \`amount\` DECIMAL(10,2) DEFAULT 0, \`date\` VARCHAR(50), \`paymentMethod\` VARCHAR(50), \`note\` TEXT)`);

        conn.release();
        console.log('>>> SYSTEM READY: ALL TABLES SECURED <<<');
    } catch (err) {
        console.error('CRITICAL: DB Init Failed:', err.message);
    }
}

// Auth API
app.post('/api/auth/register', async (req, res) => {
    try {
        const { businessName, fullName, phoneNumber, email, password } = req.body;
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO users (businessName, fullName, phoneNumber, email, password) VALUES (?, ?, ?, ?, ?)', [businessName, fullName, phoneNumber, email, hashed]);
        res.status(201).json({ success: true, user: { id: result.insertId, email, businessName, name: fullName } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'User not found' });
        const match = await bcrypt.compare(password, rows[0].password);
        if (!match) return res.status(401).json({ error: 'Wrong password' });
        res.json({ success: true, user: { id: rows[0].id, email: rows[0].email, businessName: rows[0].businessName, name: rows[0].fullName } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Entity API Helper
const entities = ['inventory', 'sales', 'suppliers', 'customers', 'expenses'];
entities.forEach(entity => {
    app.get(`/api/${entity}`, async (req, res) => {
        try {
            const [rows] = await pool.query(`SELECT * FROM \`${entity}\``);
            res.json(rows);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    app.post(`/api/${entity}`, async (req, res) => {
        try {
            const data = req.body;
            const columns = Object.keys(data);
            const values = Object.values(data).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
            
            // Build Query with Backticks for Reserved Words
            const backtickedCols = columns.map(c => `\`${c}\``).join(', ');
            const placeholders = columns.map(() => '?').join(', ');
            const updateClause = columns.map(c => `\`${c}\` = VALUES(\`${c}\`)`).join(', ');

            const query = `INSERT INTO \`${entity}\` (${backtickedCols}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClause}`;
            
            await pool.query(query, values);
            console.log(`[SYNC] Saved ${entity} entry successfully`);
            res.json({ success: true });
        } catch (err) {
            console.error(`[SYNC ERROR] ${entity}:`, err.message);
            res.status(500).json({ error: err.message });
        }
    });

    app.delete(`/api/${entity}/:id`, async (req, res) => {
        try {
            await pool.query(`DELETE FROM \`${entity}\` WHERE id = ?`, [req.params.id]);
            res.json({ success: true });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });
});

if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    ensureAllTables();
});
