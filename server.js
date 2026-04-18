import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- SERVER STARTING ---');
console.log('Node Version:', process.version);
console.log('CWD:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Lazy database pool initialization
let pool = null;
const getPool = () => {
    if (!pool) {
        console.log('Creating DB Pool...');
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT || '3306'),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 10000 
        });
    }
    return pool;
};

// --- Basic Health Check ---
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        db_config: {
            host: process.env.DB_HOST ? 'Set' : 'Missing',
            user: process.env.DB_USER ? 'Set' : 'Missing'
        }
    });
});

// --- API Routes ---
app.get('/api/db-check', async (req, res) => {
    try {
        const p = getPool();
        const connection = await p.getConnection();
        await connection.ping();
        connection.release();
        res.json({ status: 'connected', message: 'Database is reachable' });
    } catch (err) {
        console.error('DB Check Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { businessName, fullName, phoneNumber, email, password } = req.body;
        const p = getPool();
        const [existing] = await p.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'User already exists' });
        
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await p.query(
            'INSERT INTO users (businessName, fullName, phoneNumber, email, password) VALUES (?, ?, ?, ?, ?)',
            [businessName, fullName, phoneNumber, email, hashed]
        );
        res.status(201).json({ success: true, user: { id: result.insertId, email, businessName, name: fullName } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const p = getPool();
        const [rows] = await p.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });
        
        res.json({ success: true, user: { id: user.id, email: user.email, businessName: user.businessName, name: user.fullName } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Data Routes
app.get('/api/inventory', async (req, res) => {
    try {
        const p = getPool();
        const [rows] = await p.query('SELECT * FROM inventory');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/inventory', async (req, res) => {
    try {
        const item = req.body;
        const p = getPool();
        await p.query(
            'INSERT INTO inventory (id, name, category, sku, quantity, unit, purchasePrice, sellingPrice, minStock, supplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [item.id, item.name, item.category, item.sku, item.quantity, item.unit, item.purchasePrice, item.sellingPrice, item.minStock, item.supplier]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/sales', async (req, res) => {
    try {
        const p = getPool();
        const [rows] = await p.query('SELECT * FROM sales');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/sales', async (req, res) => {
    try {
        const sale = req.body;
        const p = getPool();
        await p.query(
            'INSERT INTO sales (id, invoiceNo, customerName, date, totalAmount, paidAmount, paymentMethod, status, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [sale.id, sale.invoiceNo, sale.customerName, sale.date, sale.totalAmount, sale.paidAmount, sale.paymentMethod, sale.status, JSON.stringify(sale.items)]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Frontend Serving ---

const setupFrontend = async () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('Setting up Vite for Development...');
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        console.log('Production: Serving from', distPath);
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            const indexFile = path.join(distPath, 'index.html');
            res.sendFile(indexFile, (err) => {
                if (err) {
                    res.status(404).send('Build folder (dist) is empty or index.html missing. Run npm run build.');
                }
            });
        });
    }
};

// Initial setup
setupFrontend();

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> SERVER READY ON PORT ${PORT} <<<`);
    // Initialize DB tables in background
    const initDB = async () => {
        try {
            const p = getPool();
            const conn = await p.getConnection();
            await conn.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, businessName VARCHAR(255), fullName VARCHAR(255), phoneNumber VARCHAR(20), email VARCHAR(255) UNIQUE, password VARCHAR(255), logo TEXT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
            await conn.query(`CREATE TABLE IF NOT EXISTS inventory (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), category VARCHAR(255), sku VARCHAR(255), quantity INT, unit VARCHAR(50), purchasePrice DECIMAL(10,2), sellingPrice DECIMAL(10,2), minStock INT, supplier VARCHAR(255), lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
            await conn.query(`CREATE TABLE IF NOT EXISTS sales (id VARCHAR(255) PRIMARY KEY, invoiceNo VARCHAR(255), customerName VARCHAR(255), date DATETIME, totalAmount DECIMAL(10,2), paidAmount DECIMAL(10,2), paymentMethod VARCHAR(50), status VARCHAR(50), items JSON)`);
            conn.release();
            console.log('DB Tables OK');
        } catch (e) {
            console.error('DB Init Warning:', e.message);
        }
    };
    initDB();
});
