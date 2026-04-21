const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log('--- GREENSOFT SYSTEM BOOTING: V4 (STABILITY FIX) ---');

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

// Robust function to check and add columns
async function checkAndAddColumn(conn, table, column, definition) {
    try {
        const [rows] = await conn.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
        if (rows.length === 0) {
            console.log(`Adding missing column \`${column}\` to \`${table}\`...`);
            await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
        }
    } catch (err) {
        console.error(`Error checking/adding column ${column} to ${table}:`, err.message);
    }
}

async function ensureAllTables() {
    try {
        if (!pool) pool = mysql.createPool(dbConfig);
        const conn = await pool.getConnection();
        
        console.log('Synchronizing database schema...');

        await conn.query(`CREATE TABLE IF NOT EXISTS \`users\` (id INT AUTO_INCREMENT PRIMARY KEY, businessName VARCHAR(255), fullName VARCHAR(255), phoneNumber VARCHAR(20), email VARCHAR(255) UNIQUE, password VARCHAR(255), logo TEXT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, expiryDate VARCHAR(50))`);
        await conn.query(`CREATE TABLE IF NOT EXISTS \`inventory\` (id VARCHAR(255) PRIMARY KEY, \`userId\` INT, \`name\` VARCHAR(255), \`category\` VARCHAR(255), \`quantity\` INT DEFAULT 0, \`price\` DECIMAL(10,2) DEFAULT 0)`);
        await conn.query(`CREATE TABLE IF NOT EXISTS \`sales\` (id VARCHAR(255) PRIMARY KEY, \`userId\` INT, \`customerName\` VARCHAR(255), \`items\` JSON, \`total\` DECIMAL(10,2) DEFAULT 0, \`date\` VARCHAR(50))`);
        await conn.query(`CREATE TABLE IF NOT EXISTS \`suppliers\` (id VARCHAR(255) PRIMARY KEY, \`userId\` INT, \`name\` VARCHAR(255), \`category\` VARCHAR(255), \`contact\` VARCHAR(255))`);
        await conn.query(`CREATE TABLE IF NOT EXISTS \`customers\` (id VARCHAR(255) PRIMARY KEY, \`userId\` INT, \`name\` VARCHAR(255), \`phone\` VARCHAR(20))`);
        await conn.query(`CREATE TABLE IF NOT EXISTS \`expenses\` (id VARCHAR(255) PRIMARY KEY, \`userId\` INT, \`category\` VARCHAR(255), \`amount\` DECIMAL(10,2) DEFAULT 0, \`date\` VARCHAR(50))`);
        await conn.query(`CREATE TABLE IF NOT EXISTS \`returns\` (id VARCHAR(255) PRIMARY KEY, \`userId\` INT, \`invoiceNo\` VARCHAR(255), \`customerName\` VARCHAR(255), \`totalAmount\` DECIMAL(10,2) DEFAULT 0, \`reason\` TEXT, \`type\` VARCHAR(50), \`date\` VARCHAR(50))`);
        
        // --- NEW: SUBSCRIPTION SYSTEM TABLES ---
        await conn.query(`CREATE TABLE IF NOT EXISTS \`activation_codes\` (id INT AUTO_INCREMENT PRIMARY KEY, \`code\` VARCHAR(255) UNIQUE, \`isUsed\` TINYINT(1) DEFAULT 0, \`usedAt\` VARCHAR(50), \`usedByUserId\` INT)`);

        // Sync columns for existing installations
        await checkAndAddColumn(conn, 'users', 'expiryDate', 'VARCHAR(50)');
        
        const entities = ['inventory', 'sales', 'suppliers', 'customers', 'expenses'];
        for (const ent of entities) {
            await checkAndAddColumn(conn, ent, 'userId', 'INT');
        }
        await checkAndAddColumn(conn, 'activation_codes', 'usedByUserId', 'INT');
        await checkAndAddColumn(conn, 'inventory', 'price', 'DECIMAL(10,2) DEFAULT 0');
        await checkAndAddColumn(conn, 'inventory', 'sku', 'VARCHAR(255)');
        await checkAndAddColumn(conn, 'inventory', 'modelNumber', 'VARCHAR(255)');
        await checkAndAddColumn(conn, 'inventory', 'minStock', 'INT DEFAULT 5');
        
        await checkAndAddColumn(conn, 'sales', 'customerName', 'VARCHAR(255)');
        await checkAndAddColumn(conn, 'sales', 'items', 'JSON');
        await checkAndAddColumn(conn, 'sales', 'total', 'DECIMAL(10,2) DEFAULT 0');
        await checkAndAddColumn(conn, 'sales', 'date', 'VARCHAR(50)');
        await checkAndAddColumn(conn, 'sales', 'customerPhone', 'VARCHAR(255)');
        await checkAndAddColumn(conn, 'sales', 'customerEmail', 'VARCHAR(255)');
        await checkAndAddColumn(conn, 'sales', 'customerAddress', 'TEXT');
        await checkAndAddColumn(conn, 'sales', 'invoiceNo', 'VARCHAR(255)');
        await checkAndAddColumn(conn, 'sales', 'paid', 'DECIMAL(10,2) DEFAULT 0');
        await checkAndAddColumn(conn, 'sales', 'paymentMethod', 'VARCHAR(50)');
        await checkAndAddColumn(conn, 'sales', 'status', 'VARCHAR(50)');
        
        await checkAndAddColumn(conn, 'suppliers', 'address', 'TEXT');
        await checkAndAddColumn(conn, 'suppliers', 'phone', 'VARCHAR(20)');
        await checkAndAddColumn(conn, 'suppliers', 'email', 'VARCHAR(255)');
        await checkAndAddColumn(conn, 'suppliers', 'status', 'VARCHAR(50) DEFAULT "Active"');
        
        await checkAndAddColumn(conn, 'customers', 'email', 'VARCHAR(255)');
        await checkAndAddColumn(conn, 'customers', 'address', 'TEXT');
        await checkAndAddColumn(conn, 'customers', 'orders', 'INT DEFAULT 0');
        await checkAndAddColumn(conn, 'customers', 'spent', 'DECIMAL(10,2) DEFAULT 0');
        
        await checkAndAddColumn(conn, 'expenses', 'amount', 'DECIMAL(10,2) DEFAULT 0');
        await checkAndAddColumn(conn, 'expenses', 'date', 'VARCHAR(50)');
        await checkAndAddColumn(conn, 'expenses', 'description', 'TEXT');
        await checkAndAddColumn(conn, 'expenses', 'employeeName', 'VARCHAR(255)');
        await checkAndAddColumn(conn, 'expenses', 'employeePhone', 'VARCHAR(20)');

        conn.release();
        console.log('>>> DB SYNC OK <<<');
    } catch (err) {
        console.error('DB Sync Error:', err.message);
    }
}

// --- API ---
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Auth
app.post('/api/auth/register', async (req, res) => {
    try {
        const { businessName, fullName, phoneNumber, email, password } = req.body;
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });
        
        const hashed = await bcrypt.hash(password, 10);
        
        // --- TRIAL SYSTEM: 7 Days from Registration ---
        const trialExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        
        const [result] = await pool.query('INSERT INTO users (businessName, fullName, phoneNumber, email, password, expiryDate) VALUES (?, ?, ?, ?, ?, ?)', [businessName, fullName, phoneNumber, email, hashed, trialExpiry]);
        
        res.status(201).json({ success: true, user: { id: result.insertId, email, businessName, name: fullName, expiryDate: trialExpiry } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'User not found' });
        const match = await bcrypt.compare(password, rows[0].password);
        if (!match) return res.status(401).json({ error: 'Wrong password' });
        res.json({ success: true, user: { id: rows[0].id, email: rows[0].email, businessName: rows[0].businessName, name: rows[0].fullName, expiryDate: rows[0].expiryDate } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- SUBSCRIPTION API ---
app.get('/api/subscription/status', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) return res.status(400).json({ error: 'User ID required' });
        
        const [rows] = await pool.query('SELECT expiryDate FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        
        const expiryDate = rows[0].expiryDate;
        const isActive = new Date(expiryDate) > new Date();
        res.json({ active: isActive, expiryDate });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/subscription/activate', async (req, res) => {
    try {
        const { code, userId } = req.body;
        if (!code) return res.status(400).json({ error: 'Code is required' });
        if (!userId) return res.status(400).json({ error: 'User ID is required' });
x
        const [codes] = await pool.query('SELECT * FROM activation_codes WHERE code = ? AND isUsed = 0', [code]);
        if (codes.length === 0) {
            return res.status(401).json({ error: 'Invalid or already used activation code' });
        }

        // Mark code as used by this user
        await pool.query('UPDATE activation_codes SET isUsed = 1, usedAt = ?, usedByUserId = ? WHERE id = ?', [new Date().toISOString(), userId, codes[0].id]);

        // Extend user subscription by 30 days
        const [userRows] = await pool.query('SELECT expiryDate FROM users WHERE id = ?', [userId]);
        let currentExpiry = new Date(userRows[0].expiryDate);
        let baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
        
        const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await pool.query('UPDATE users SET expiryDate = ? WHERE id = ?', [newExpiry, userId]);

        res.json({ success: true, expiryDate: newExpiry });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin-only: Generate codes (Optional, but useful for the owner)
app.post('/api/admin/generate-codes', async (req, res) => {
    try {
        const { count, secret } = req.body; 
        // Simple protection: only if secret matches (owner can change this in code)
        if (secret !== 'greensoft_admin_2024') return res.status(403).json({ error: 'Forbidden' });

        const codes = [];
        for (let i = 0; i < (count || 5); i++) {
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            try {
                await pool.query('INSERT INTO activation_codes (code) VALUES (?)', [code]);
                codes.push(code);
            } catch (e) { /* ignore duplicate randoms */ }
        }
        res.json({ codes });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Entity API
const entities = ['inventory', 'sales', 'suppliers', 'customers', 'expenses', 'returns'];
entities.forEach(entity => {
    app.get(`/api/${entity}`, async (req, res) => {
        try {
            const userId = req.query.userId;
            if (!userId) return res.status(400).json({ error: 'User ID required' });
            const [rows] = await pool.query(`SELECT * FROM \`${entity}\` WHERE userId = ?`, [userId]);
            res.json(rows);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    app.post(`/api/${entity}`, async (req, res) => {
        try {
            const data = req.body;
            if (!data.userId) return res.status(400).json({ error: 'User ID required' });
            
            const columns = Object.keys(data);
            const values = Object.values(data).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
            const backtickedCols = columns.map(c => `\`${c}\``).join(', ');
            const placeholders = columns.map(() => '?').join(', ');
            const updateClause = columns.map(c => `\`${c}\` = VALUES(\`${c}\`)`).join(', ');
            const query = `INSERT INTO \`${entity}\` (${backtickedCols}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClause}`;
            await pool.query(query, values);
            res.json({ success: true });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    app.delete(`/api/${entity}/:id`, async (req, res) => {
        try {
            const userId = req.query.userId;
            if (!userId) return res.status(400).json({ error: 'User ID required' });
            await pool.query(`DELETE FROM \`${entity}\` WHERE id = ? AND userId = ?`, [req.params.id, userId]);
            res.json({ success: true });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });
});

// --- STATIC SERVING ---
// Using __dirname is safer for shared hosting like Hostinger
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Handle React Router paths
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving index.html:', err.message);
            res.status(500).send('Frontend static files not found. Please ensure "npm run build" was executed.');
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
    ensureAllTables();
});
