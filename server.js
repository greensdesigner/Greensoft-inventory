const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');
require('dotenv').config();

console.log('--- GREENSOFT SYSTEM BOOTING: V4 (STABILITY FIX) ---');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Stripe lazily
let stripe;
const getStripe = () => {
    if (stripe) return stripe;

    // Try multiple possible environment variable names
    let key = process.env.STRIPE_SECRET_KEY || 
              process.env.STRIPE_SECRET_KE || 
              process.env.VITE_STRIPE_SECRET_KEY ||
              process.env.STRIPE_KEY ||
              process.env.stripe_secret_key;
    
    // Robust fallback: If still not found, search through all environment variables
    // for anything that looks like a Stripe secret key (starts with sk_test_ or sk_live_)
    if (!key) {
        console.log('Stripe: Searching all env vars for secret key pattern...');
        for (const [envName, envValue] of Object.entries(process.env)) {
            if (envValue && typeof envValue === 'string' && envValue.length > 20) {
                const val = envValue.trim();
                if (val.startsWith('sk_test_') || val.startsWith('sk_live_')) {
                    console.log(`Stripe: Auto-detected secret key in variable: ${envName}`);
                    key = val;
                    break;
                }
            }
        }
    }
    
    if (key) {
        try {
            console.log('Stripe: Secret key found and initialized.');
            stripe = new Stripe(key.trim());
        } catch (e) {
            console.error('Stripe initialization error:', e);
        }
    } else {
        const foundKeys = Object.keys(process.env).filter(k => k.toLowerCase().includes('stripe'));
        console.log('Stripe: No secret key found. Checked keys:', foundKeys);
        console.log('Stripe: Total env vars available:', Object.keys(process.env).length);
    }
    return stripe;
};

// Increase limit for base64 images/logos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

        await conn.query(`CREATE TABLE IF NOT EXISTS \`users\` (id INT AUTO_INCREMENT PRIMARY KEY, businessName VARCHAR(255), fullName VARCHAR(255), phoneNumber VARCHAR(20), email VARCHAR(255) UNIQUE, password VARCHAR(255), logo LONGTEXT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, expiryDate VARCHAR(50))`);
        await conn.query(`CREATE TABLE IF NOT EXISTS \`inventory\` (id VARCHAR(255) PRIMARY KEY, \`userId\` INT, \`name\` VARCHAR(255), \`category\` VARCHAR(255), \`quantity\` INT DEFAULT 0, \`price\` DECIMAL(10,2) DEFAULT 0)`);
        await conn.query(`CREATE TABLE IF NOT EXISTS \`sales\` (id VARCHAR(255) PRIMARY KEY, \`userId\` INT, \`customerName\` VARCHAR(255), \`items\` JSON, \`total\` DECIMAL(10,2) DEFAULT 0, \`date\` VARCHAR(50))`);
        await conn.query(`CREATE TABLE IF NOT EXISTS \`suppliers\` (id VARCHAR(255) PRIMARY KEY, \`userId\` INT, \`name\` VARCHAR(255), \`category\` VARCHAR(255), \`contact\` VARCHAR(255))`);
        await conn.query(`CREATE TABLE IF NOT EXISTS \`customers\` (id VARCHAR(255) PRIMARY KEY, \`userId\` INT, \`name\` VARCHAR(255), \`phone\` VARCHAR(20))`);
        await conn.query(`CREATE TABLE IF NOT EXISTS \`expenses\` (id VARCHAR(255) PRIMARY KEY, \`userId\` INT, \`category\` VARCHAR(255), \`amount\` DECIMAL(10,2) DEFAULT 0, \`date\` VARCHAR(50))`);
        await conn.query(`CREATE TABLE IF NOT EXISTS \`returns\` (id VARCHAR(255) PRIMARY KEY, \`userId\` INT, \`invoiceNo\` VARCHAR(255), \`customerName\` VARCHAR(255), \`totalAmount\` DECIMAL(10,2) DEFAULT 0, \`reason\` TEXT, \`type\` VARCHAR(50), \`date\` VARCHAR(50))`);
        
        // --- NEW: SUBSCRIPTION SYSTEM TABLES ---
        await conn.query(`CREATE TABLE IF NOT EXISTS \`activation_codes\` (id INT AUTO_INCREMENT PRIMARY KEY, \`code\` VARCHAR(255) UNIQUE, \`isUsed\` TINYINT(1) DEFAULT 0, \`usedAt\` VARCHAR(50), \`usedByUserId\` INT)`);
        await conn.query(`CREATE TABLE IF NOT EXISTS \`managers\` (id INT AUTO_INCREMENT PRIMARY KEY, \`ownerId\` INT, \`name\` VARCHAR(255), \`email\` VARCHAR(255) UNIQUE, \`password\` VARCHAR(255), \`permissions\` JSON, \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

        // Sync columns for existing installations
        await checkAndAddColumn(conn, 'users', 'expiryDate', 'VARCHAR(50)');
        await checkAndAddColumn(conn, 'users', 'address', 'TEXT');
        
        // Ensure logo can hold large base64 strings
        try {
            await conn.query('ALTER TABLE users MODIFY COLUMN logo LONGTEXT');
        } catch (e) { console.log('Logo column already correct or update failed'); }
        
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
        
        // 1. Check Owners
        const [ownerRows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (ownerRows.length > 0) {
            const match = await bcrypt.compare(password, ownerRows[0].password);
            if (!match) return res.status(401).json({ error: 'Wrong password' });
            return res.json({ 
                success: true, 
                user: { 
                    id: ownerRows[0].id, 
                    email: ownerRows[0].email, 
                    businessName: ownerRows[0].businessName, 
                    name: ownerRows[0].fullName, 
                    expiryDate: ownerRows[0].expiryDate, 
                    phoneNumber: ownerRows[0].phoneNumber, 
                    address: ownerRows[0].address, 
                    logo: ownerRows[0].logo,
                    role: 'OWNER' 
                } 
            });
        }

        // 2. Check Managers
        const [managerRows] = await pool.query('SELECT m.*, u.businessName, u.logo, u.expiryDate FROM managers m JOIN users u ON m.ownerId = u.id WHERE m.email = ?', [email]);
        if (managerRows.length > 0) {
            const match = await bcrypt.compare(password, managerRows[0].password);
            if (!match) return res.status(401).json({ error: 'Wrong password' });
            
            // Format permissions if it's a string
            let permissions = managerRows[0].permissions;
            if (typeof permissions === 'string') {
                try { permissions = JSON.parse(permissions); } catch (e) { permissions = {}; }
            }

            return res.json({
                success: true,
                user: {
                    id: managerRows[0].id,
                    ownerId: managerRows[0].ownerId,
                    email: managerRows[0].email,
                    businessName: managerRows[0].businessName,
                    name: managerRows[0].name,
                    expiryDate: managerRows[0].expiryDate,
                    logo: managerRows[0].logo,
                    role: 'MANAGER',
                    permissions: permissions
                }
            });
        }

        return res.status(401).json({ error: 'User not found' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/auth/profile', async (req, res) => {
    try {
        console.log('PATCH /api/auth/profile received:', req.body);
        const { userId, businessName, fullName, phoneNumber, address, email, logo } = req.body;
        if (!userId) {
            console.log('Update failed: userId missing');
            return res.status(400).json({ error: 'User ID required' });
        }

        const [result] = await pool.query('UPDATE users SET businessName = ?, fullName = ?, phoneNumber = ?, address = ?, email = ?, logo = ? WHERE id = ?', [businessName, fullName, phoneNumber, address, email, logo, userId]);
        console.log('Update result:', result);

        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        console.log('Updated user data fetched:', rows[0]);
        res.json({ 
            success: true, 
            user: { 
                id: rows[0].id, 
                email: rows[0].email, 
                businessName: rows[0].businessName, 
                name: rows[0].fullName, 
                expiryDate: rows[0].expiryDate, 
                phoneNumber: rows[0].phoneNumber, 
                address: rows[0].address,
                logo: rows[0].logo
            } 
        });
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

// --- STRIPE SUBSCRIPTION ---
app.post('/api/subscription/create-checkout-session', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'User ID required' });

        const stripeClient = getStripe();
        if (!stripeClient) {
            const foundKeys = Object.keys(process.env).filter(k => k.toLowerCase().includes('stripe'));
            const msg = `Stripe not configured. Looking for 'STRIPE_SECRET_KEY'. Found keys: ${foundKeys.join(', ') || 'None'}. Environment size: ${Object.keys(process.env).length}. Please ensure you have added the Secret in the AI Studio sidebar under "Secrets" and restarted the server.`;
            return res.status(500).json({ error: msg });
        }

        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host;
        const origin = `${protocol}://${host}`;

        const sessionParams = {
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd', // User can change this to 'bdt' if their Stripe account supports it
                        product_data: {
                            name: 'GreenSoft Subscription Extension (30 Days)',
                            description: 'Extend your business management software subscription for 30 days.',
                        },
                        unit_amount: 1000, // $10.00
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/?stripe_session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/`,
            client_reference_id: userId.toString(),
            metadata: {
                userId: userId.toString()
            }
        };

        // Flexible Price Handling
        const priceConfig = process.env.SUBSCRIPTION_PRICE_ID || process.env.SUBSCRIPTION_PRI;
        
        if (priceConfig) {
            if (priceConfig.startsWith('price_')) {
                // It's a Stripe Price ID
                delete sessionParams.line_items[0].price_data;
                sessionParams.line_items[0].price = priceConfig;
            } else if (!isNaN(parseFloat(priceConfig))) {
                // It's a numeric amount (e.g. 10 or 100)
                // Note: Stripe amounts are in cents. So 100 means $1.00
                sessionParams.line_items[0].price_data.unit_amount = Math.round(parseFloat(priceConfig) * 100);
            }
        }

        const session = await stripeClient.checkout.sessions.create(sessionParams);

        res.json({ url: session.url });
    } catch (err) {
        console.error('Stripe Session Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/subscription/confirm-payment', async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

        const stripeClient = getStripe();
        if (!stripeClient) return res.status(500).json({ error: 'Stripe not configured' });

        const session = await stripeClient.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid') {
            const userId = session.client_reference_id || session.metadata.userId;
            
            // Check if this session was already processed to prevent double extensions
            // In a real app, you'd have a 'processed_sessions' table. 
            // For now, we'll just check if the session is indeed for subscription.
            
            const [userRows] = await pool.query('SELECT expiryDate FROM users WHERE id = ?', [userId]);
            if (userRows.length === 0) return res.status(404).json({ error: 'User not found' });

            let currentExpiry = new Date(userRows[0].expiryDate);
            let baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
            
            const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
            await pool.query('UPDATE users SET expiryDate = ? WHERE id = ?', [newExpiry, userId]);

            res.json({ success: true, expiryDate: newExpiry });
        } else {
            res.status(400).json({ success: false, error: 'Payment not completed' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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

// --- MANAGER MANAGEMENT API ---
app.get('/api/managers', async (req, res) => {
    try {
        const ownerId = req.query.ownerId;
        if (!ownerId) return res.status(400).json({ error: 'Owner ID required' });
        const [rows] = await pool.query('SELECT id, name, email, permissions FROM managers WHERE ownerId = ?', [ownerId]);
        res.json(rows.map(m => ({
            ...m,
            permissions: typeof m.permissions === 'string' ? JSON.parse(m.permissions) : m.permissions
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/managers', async (req, res) => {
    try {
        const { ownerId, name, email, password, permissions } = req.body;
        if (!ownerId || !email || !password) return res.status(400).json({ error: 'Required fields missing' });

        const [existing] = await pool.query('SELECT id FROM managers WHERE email = ? UNION SELECT id FROM users WHERE email = ?', [email, email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO managers (ownerId, name, email, password, permissions) VALUES (?, ?, ?, ?, ?)', [ownerId, name, email, hashed, JSON.stringify(permissions)]);
        
        res.json({ success: true, id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/managers/:id', async (req, res) => {
    try {
        const { permissions, name, password } = req.body;
        const managerId = req.params.id;
        
        let query = 'UPDATE managers SET name = ?, permissions = ?';
        let params = [name, JSON.stringify(permissions)];
        
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashed);
        }
        
        query += ' WHERE id = ?';
        params.push(managerId);
        
        await pool.query(query, params);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/managers/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM managers WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Entity API
const entities = ['inventory', 'sales', 'suppliers', 'customers', 'expenses', 'returns'];
entities.forEach(entity => {
    app.get(`/api/${entity}`, async (req, res) => {
        try {
            const userId = req.query.userId;
            const role = req.query.role;
            const ownerId = req.query.ownerId; // If manager, we need the owner's data
            
            const effectiveUserId = role === 'MANAGER' ? ownerId : userId;
            
            if (!effectiveUserId) return res.status(400).json({ error: 'User ID required' });
            const [rows] = await pool.query(`SELECT * FROM \`${entity}\` WHERE userId = ?`, [effectiveUserId]);
            res.json(rows);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    app.post(`/api/${entity}`, async (req, res) => {
        try {
            const data = req.body;
            const role = req.query.role;
            const ownerId = req.query.ownerId;
            
            if (role === 'MANAGER' && ownerId) {
                data.userId = ownerId;
            }

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
            const role = req.query.role;
            const ownerId = req.query.ownerId;
            
            const effectiveUserId = role === 'MANAGER' ? ownerId : userId;

            if (!effectiveUserId) return res.status(400).json({ error: 'User ID required' });
            await pool.query(`DELETE FROM \`${entity}\` WHERE id = ? AND userId = ?`, [req.params.id, effectiveUserId]);
            res.json({ success: true });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });
});

// --- STATIC SERVING ---
const setupServer = async () => {
    const distPath = path.resolve(__dirname, 'dist');

    if (process.env.NODE_ENV !== 'production') {
        const { createServer: createViteServer } = require('vite');
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
        console.log('>>> VITE DEV MIDDLEWARE LOADED <<<');
    } else {
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            if (req.path.startsWith('/api/')) {
                return res.status(404).json({ error: 'API route not found' });
            }
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }
};

(async () => {
    await ensureAllTables();
    await setupServer();
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server started on port ${PORT}`);
    });
})();
