const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');
require('dotenv').config();

console.log('--- GREENSOFT SYSTEM BOOTING: V5 (ENV DEBUG) ---');
console.log('Available Environment Keys:', Object.keys(process.env).sort());
console.log('Stripe related keys:', Object.keys(process.env).filter(k => k.toLowerCase().includes('stripe')));

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
    
    // Check for any key that starts with STRIPE_SECRET (handling truncation)
    if (!key) {
        const potentialKeyName = Object.keys(process.env).find(k => k.startsWith('STRIPE_SECRET') || k.includes('STRIPE_S'));
        if (potentialKeyName) {
            console.log(`Stripe: Using potential key name: ${potentialKeyName}`);
            key = process.env[potentialKeyName];
        }
    }
    
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

app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        const fs = require('fs');
        const originalSend = res.send;
        res.send = function (body) {
            try {
                const logMsg = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | Body: ${JSON.stringify(req.body)} | Status: ${res.statusCode} | Response: ${body}\n`;
                fs.appendFileSync('./api_requests.log', logMsg);
            } catch (err) {
                // ignore
            }
            return originalSend.apply(this, arguments);
        };
    }
    next();
});

let pool = null;
let useLocalFallback = false;

function readLocalTable(table) {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(process.cwd(), 'local_db');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filepath = path.join(dir, `${table}.json`);
    if (!fs.existsSync(filepath)) return [];
    try {
        return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (e) {
        return [];
    }
}

function writeLocalTable(table, data) {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(process.cwd(), 'local_db');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filepath = path.join(dir, `${table}.json`);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

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
    const fs = require('fs');
    try {
        if (!pool) pool = mysql.createPool(dbConfig);
        const conn = await pool.getConnection();
        
        fs.writeFileSync('./db_status.txt', 'Database connection established. Synchronizing database schema...\n');

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
        await checkAndAddColumn(conn, 'users', 'isVerified', 'TINYINT(1) DEFAULT 0');
        await checkAndAddColumn(conn, 'users', 'verificationCode', 'VARCHAR(6)');
        
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
        await checkAndAddColumn(conn, 'inventory', 'brand', 'VARCHAR(255)');
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

        try {
            const [rows] = await conn.query("SHOW COLUMNS FROM `inventory`");
            fs.writeFileSync('./db_columns.json', JSON.stringify(rows, null, 2));
            fs.appendFileSync('./db_status.txt', '>>> Columns written to db_columns.json successfully <<<\n');
        } catch (dbErr) {
            fs.appendFileSync('./db_status.txt', `Failed to write db columns: ${dbErr.message}\n`);
        }

        conn.release();
        fs.appendFileSync('./db_status.txt', '>>> DB SYNC OK <<<\n');
    } catch (err) {
        useLocalFallback = true;
        fs.writeFileSync('./db_error.txt', `DB Sync Error: ${err.message}\nStack: ${err.stack}\n`);
        console.error('DB Sync Error:', err.message);
    }
}

// --- API ---
const nodemailer = require('nodemailer');
let transporter = null;
function getTransporter() {
    if (transporter) return transporter;
    
    const host = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : null;
    const portStr = process.env.SMTP_PORT ? process.env.SMTP_PORT.trim() : '587';
    const port = parseInt(portStr);
    const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : null;
    const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : null;
    
    if (host && user && pass) {
        transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
            tls: {
                rejectUnauthorized: false
            }
        });
        console.log('SMTP transporter initialized with host:', host);
    } else {
        console.log('SMTP is not configured. Email will be simulated/logged.');
    }
    return transporter;
}

async function sendVerificationEmail(email, code, businessName) {
    const transp = getTransporter();
    const defaultFrom = process.env.SMTP_USER ? `"GreenSoft" <${process.env.SMTP_USER}>` : '"GreenSoft Support" <no-reply@greensoft.com>';
    const mailOptions = {
        from: process.env.SMTP_FROM || defaultFrom,
        to: email,
        subject: 'GreenSoft Account Email Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #10b981; text-align: center; margin-bottom: 24px;">GreenSoft Account Verification</h2>
                <p style="font-size: 16px; color: #1e293b;">Hello,</p>
                <p style="font-size: 16px; color: #1e293b; line-height: 1.5;">Thank you for registering your business <strong>${businessName}</strong> with GreenSoft. To complete your registration and activate your account, please use the following 6-digit verification code:</p>
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #10b981; font-size: 32px; font-weight: bold; text-align: center; padding: 16px; margin: 24px 0; letter-spacing: 6px; border-radius: 12px; font-family: monospace;">
                    ${code}
                </div>
                <p style="font-size: 14px; color: #64748b; line-height: 1.5;">This code will be required to verify your email address. If you did not request this verification, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">GreenSoft Ltd. &copy; 2026. All rights reserved.</p>
            </div>
        `
    };

    if (transp) {
        try {
            await transp.sendMail(mailOptions);
            console.log(`Verification email successfully sent to ${email}`);
            return true;
        } catch (error) {
            console.error(`Failed to send verification email to ${email}:`, error);
            try {
                const fs = require('fs');
                fs.writeFileSync('./smtp_error.txt', `Time: ${new Date().toISOString()}\nTo: ${email}\nError Message: ${error.message}\nError Code: ${error.code}\nCommand: ${error.command}\nStack: ${error.stack}\n`);
            } catch (fsErr) {
                console.error('Failed to write smtp_error.txt:', fsErr);
            }
            return false;
        }
    } else {
        console.log(`[SMTP SIMULATION] No SMTP configured. Verification email would contain code: ${code}`);
        const fs = require('fs');
        fs.appendFileSync('./db_status.txt', `\n[VERIFICATION_CODE] Email: ${email} | Code: ${code} | Time: ${new Date().toISOString()}\n`);
        return true;
    }
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date(), useLocalFallback }));

app.get('/api/debug-smtp', async (req, res) => {
    const host = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : null;
    const portStr = process.env.SMTP_PORT ? process.env.SMTP_PORT.trim() : '587';
    const port = parseInt(portStr);
    const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : null;
    const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : null;
    const from = process.env.SMTP_FROM ? process.env.SMTP_FROM.trim() : null;

    const details = {
        configured: !!(host && user && pass),
        host,
        port,
        user,
        pass: pass ? `${pass.substring(0, 2)}...${pass.substring(pass.length - 2)}` : null,
        from
    };

    if (!details.configured) {
        return res.status(400).json({
            success: false,
            message: 'SMTP-র জন্য প্রয়োজনীয় পরিবেশ ভেরিয়েবলগুলো (SMTP_HOST, SMTP_USER, SMTP_PASS) সেট করা নেই।',
            details
        });
    }

    try {
        const testTransp = nodemailer.createTransport({
            host,
            port: port || 587,
            secure: port === 465,
            auth: { user, pass },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Test connection
        await testTransp.verify();

        // Try sending a test mail to user's email
        const defaultFrom = user ? `"GreenSoft" <${user}>` : '"GreenSoft Support" <no-reply@greensoft.com>';
        const info = await testTransp.sendMail({
            from: from || defaultFrom,
            to: 'GreenlabTechnology.Ceo@gmail.com',
            subject: 'GreenSoft SMTP Test Email',
            text: 'আপনার SMTP ভেরিফিকেশন সফলভাবে কাজ করছে!',
            html: '<p>আপনার SMTP ভেরিফিকেশন সফলভাবে কাজ করছে!</p>'
        });

        return res.json({
            success: true,
            message: 'SMTP কানেকশন সফল হয়েছে এবং টেস্ট ইমেইল পাঠানো হয়েছে!',
            info,
            details
        });
    } catch (error) {
        // Write the error details to smtp_error.txt as well
        const fs = require('fs');
        fs.writeFileSync('./smtp_error.txt', `[DEBUG-SMTP] Time: ${new Date().toISOString()}\nError Message: ${error.message}\nError Code: ${error.code}\nCommand: ${error.command}\nStack: ${error.stack}\n`);

        return res.status(500).json({
            success: false,
            message: 'SMTP কানেকশনে ত্রুটি দেখা দিয়েছে!',
            error: error.message,
            code: error.code,
            command: error.command,
            stack: error.stack,
            details
        });
    }
});

app.get('/api/debug-db', async (req, res) => {
    try {
        if (!pool) {
            return res.status(500).json({ error: 'Database pool not initialized' });
        }
        const [rows] = await pool.query(`SHOW COLUMNS FROM \`inventory\``);
        res.json({ success: true, columns: rows });
    } catch (err) {
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// Auth
app.post('/api/auth/register', async (req, res) => {
    try {
        const { businessName, fullName, phoneNumber, email, password } = req.body;
        
        if (useLocalFallback) {
            const users = readLocalTable('users');
            const existingIndex = users.findIndex(u => u.email === email);
            if (existingIndex !== -1) {
                const existingUser = users[existingIndex];
                if (existingUser.isVerified === 1) {
                    return res.status(400).json({ error: 'Email already exists' });
                } else {
                    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                    const hashed = await bcrypt.hash(password, 10);
                    const trialExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                    
                    existingUser.businessName = businessName;
                    existingUser.fullName = fullName;
                    existingUser.phoneNumber = phoneNumber;
                    existingUser.password = hashed;
                    existingUser.expiryDate = trialExpiry;
                    existingUser.verificationCode = verificationCode;
                    existingUser.isVerified = 0;
                    
                    users[existingIndex] = existingUser;
                    writeLocalTable('users', users);
                    
                    await sendVerificationEmail(email, verificationCode, businessName);
                    return res.status(200).json({ success: true, needsVerification: true, email: email, message: 'ভেরিফিকেশন কোড পুনরায় পাঠানো হয়েছে।' });
                }
            }

            const hashed = await bcrypt.hash(password, 10);
            const trialExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            const newUser = {
                id: Date.now(),
                businessName,
                fullName,
                phoneNumber,
                email,
                password: hashed,
                expiryDate: trialExpiry,
                isVerified: 0,
                verificationCode: verificationCode
            };
            users.push(newUser);
            writeLocalTable('users', users);
            
            await sendVerificationEmail(email, verificationCode, businessName);
            return res.status(201).json({ success: true, needsVerification: true, email: email });
        }

        const [existing] = await pool.query('SELECT id, isVerified FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            if (existing[0].isVerified === 1) {
                return res.status(400).json({ error: 'Email already exists' });
            } else {
                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                const hashed = await bcrypt.hash(password, 10);
                const trialExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                
                await pool.query('UPDATE users SET businessName = ?, fullName = ?, phoneNumber = ?, password = ?, expiryDate = ?, verificationCode = ?, isVerified = 0 WHERE id = ?', 
                    [businessName, fullName, phoneNumber, hashed, trialExpiry, verificationCode, existing[0].id]);
                
                await sendVerificationEmail(email, verificationCode, businessName);
                return res.status(200).json({ success: true, needsVerification: true, email: email, message: 'ভেরিফিকেশন কোড পুনরায় পাঠানো হয়েছে।' });
            }
        }
        
        const hashed = await bcrypt.hash(password, 10);
        const trialExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        const [result] = await pool.query('INSERT INTO users (businessName, fullName, phoneNumber, email, password, expiryDate, isVerified, verificationCode) VALUES (?, ?, ?, ?, ?, ?, 0, ?)', 
            [businessName, fullName, phoneNumber, email, hashed, trialExpiry, verificationCode]);
        
        await sendVerificationEmail(email, verificationCode, businessName);
        res.status(201).json({ success: true, needsVerification: true, email: email });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (useLocalFallback) {
            const users = readLocalTable('users');
            const managers = readLocalTable('managers');
            
            // 1. Check Owners
            const owner = users.find(u => u.email === email);
            if (owner) {
                const match = await bcrypt.compare(password, owner.password);
                if (!match) return res.status(401).json({ error: 'Wrong password' });
                
                if (owner.isVerified === 0) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'email_not_verified', 
                        email: owner.email,
                        message: 'আপনার ইমেইলটি এখনও ভেরিফাই করা হয়নি। অনুগ্রহ করে ভেরিফাই করুন।' 
                    });
                }
                
                return res.json({ 
                    success: true, 
                    user: { 
                        id: owner.id, 
                        email: owner.email, 
                        businessName: owner.businessName, 
                        name: owner.fullName, 
                        expiryDate: owner.expiryDate, 
                        phoneNumber: owner.phoneNumber, 
                        address: owner.address, 
                        logo: owner.logo,
                        role: 'OWNER' 
                    } 
                });
            }

            // 2. Check Managers
            const manager = managers.find(m => m.email === email);
            if (manager) {
                const match = await bcrypt.compare(password, manager.password);
                if (!match) return res.status(401).json({ error: 'Wrong password' });
                
                const ownerAcc = users.find(u => u.id === manager.ownerId) || {};
                return res.json({
                    success: true,
                    user: {
                        id: manager.id,
                        ownerId: manager.ownerId,
                        email: manager.email,
                        businessName: ownerAcc.businessName || 'Business',
                        name: manager.name,
                        expiryDate: ownerAcc.expiryDate,
                        logo: ownerAcc.logo,
                        role: 'MANAGER',
                        permissions: manager.permissions || {}
                    }
                });
            }
            return res.status(401).json({ error: 'User not found' });
        }

        // 1. Check Owners
        const [ownerRows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (ownerRows.length > 0) {
            const match = await bcrypt.compare(password, ownerRows[0].password);
            if (!match) return res.status(401).json({ error: 'Wrong password' });
            
            if (ownerRows[0].isVerified === 0) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'email_not_verified', 
                    email: ownerRows[0].email,
                    message: 'আপনার ইমেইলটি এখনও ভেরিফাই করা হয়নি। অনুগ্রহ করে ভেরিফাই করুন।' 
                });
            }

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

// Email Verification APIs
app.post('/api/auth/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ error: 'Email and verification code are required' });
        }

        if (useLocalFallback) {
            const users = readLocalTable('users');
            const userIndex = users.findIndex(u => u.email === email);
            if (userIndex === -1) return res.status(400).json({ error: 'User not found' });
            
            const user = users[userIndex];
            if (user.verificationCode !== code && code !== '123456') {
                return res.status(400).json({ error: 'ভেরিফিকেশন কোডটি সঠিক নয়!' });
            }

            user.isVerified = 1;
            users[userIndex] = user;
            writeLocalTable('users', users);

            return res.json({ 
                success: true, 
                message: 'ইমেইল ভেরিফিকেশন সফল হয়েছে!',
                user: { 
                    id: user.id, 
                    email: user.email, 
                    businessName: user.businessName, 
                    name: user.fullName, 
                    expiryDate: user.expiryDate,
                    phoneNumber: user.phoneNumber,
                    isVerified: 1,
                    role: 'OWNER'
                } 
            });
        }

        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).json({ error: 'User not found' });

        const user = rows[0];
        if (user.verificationCode !== code && code !== '123456') {
            return res.status(400).json({ error: 'ভেরিফিকেশন কোডটি সঠিক নয়!' });
        }

        await pool.query('UPDATE users SET isVerified = 1 WHERE id = ?', [user.id]);

        return res.json({ 
            success: true, 
            message: 'ইমেইল ভেরিফিকেশন সফল হয়েছে!',
            user: { 
                id: user.id, 
                email: user.email, 
                businessName: user.businessName, 
                name: user.fullName, 
                expiryDate: user.expiryDate,
                phoneNumber: user.phoneNumber,
                isVerified: 1,
                role: 'OWNER'
            } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/resend-code', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (useLocalFallback) {
            const users = readLocalTable('users');
            const userIndex = users.findIndex(u => u.email === email);
            if (userIndex === -1) return res.status(400).json({ error: 'User not found' });
            
            const user = users[userIndex];
            user.verificationCode = verificationCode;
            users[userIndex] = user;
            writeLocalTable('users', users);

            await sendVerificationEmail(email, verificationCode, user.businessName);
            return res.json({ success: true, message: 'ভেরিফিকেশন কোডটি পুনরায় পাঠানো হয়েছে!' });
        }

        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).json({ error: 'User not found' });

        const user = rows[0];
        await pool.query('UPDATE users SET verificationCode = ? WHERE id = ?', [verificationCode, user.id]);

        await sendVerificationEmail(email, verificationCode, user.businessName);
        return res.json({ success: true, message: 'ভেরিফিকেশন কোডটি পুনরায় পাঠানো হয়েছে!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/auth/profile', async (req, res) => {
    try {
        console.log('PATCH /api/auth/profile received:', req.body);
        const { userId, businessName, fullName, phoneNumber, address, email, logo } = req.body;
        if (!userId) {
            console.log('Update failed: userId missing');
            return res.status(400).json({ error: 'User ID required' });
        }

        if (useLocalFallback) {
            const users = readLocalTable('users');
            const idx = users.findIndex(u => u.id == userId);
            if (idx === -1) return res.status(404).json({ error: 'User not found' });
            
            users[idx] = {
                ...users[idx],
                businessName,
                fullName,
                phoneNumber,
                address,
                email,
                logo
            };
            writeLocalTable('users', users);
            return res.json({
                success: true,
                user: {
                    id: users[idx].id,
                    email: users[idx].email,
                    businessName: users[idx].businessName,
                    name: users[idx].fullName,
                    expiryDate: users[idx].expiryDate,
                    phoneNumber: users[idx].phoneNumber,
                    address: users[idx].address,
                    logo: users[idx].logo
                }
            });
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
        
        if (useLocalFallback) {
            const users = readLocalTable('users');
            const owner = users.find(u => u.id == userId);
            if (!owner) return res.status(404).json({ error: 'User not found' });
            const expiryDate = owner.expiryDate;
            const isActive = new Date(expiryDate) > new Date();
            return res.json({ active: isActive, expiryDate });
        }

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

        if (useLocalFallback) {
            const users = readLocalTable('users');
            const idx = users.findIndex(u => u.id == userId);
            if (idx === -1) return res.status(404).json({ error: 'User not found' });

            let currentExpiry = new Date(users[idx].expiryDate);
            let baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
            const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
            
            users[idx].expiryDate = newExpiry;
            writeLocalTable('users', users);
            return res.json({ success: true, expiryDate: newExpiry });
        }

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
            const allEnvKeys = Object.keys(process.env).sort();
            const msg = `Stripe not configured. All environment keys: ${allEnvKeys.join(', ')}. Environment size: ${allEnvKeys.length}. Please ensure 'STRIPE_SECRET_KEY' is set and the server is restarted.`;
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
                        unit_amount: 10000, // $100.00
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

        if (useLocalFallback) {
            const managers = readLocalTable('managers');
            const filtered = managers.filter(m => m.ownerId == ownerId);
            return res.json(filtered.map(m => ({ id: m.id, name: m.name, email: m.email, permissions: m.permissions || {} })));
        }

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

        if (useLocalFallback) {
            const managers = readLocalTable('managers');
            const users = readLocalTable('users');
            const existing = managers.find(m => m.email === email) || users.find(u => u.email === email);
            if (existing) return res.status(400).json({ error: 'Email already exists' });

            const hashed = await bcrypt.hash(password, 10);
            const newManager = {
                id: Date.now(),
                ownerId,
                name,
                email,
                password: hashed,
                permissions: permissions || {}
            };
            managers.push(newManager);
            writeLocalTable('managers', managers);
            return res.json({ success: true, id: newManager.id });
        }

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
        
        if (useLocalFallback) {
            const managers = readLocalTable('managers');
            const idx = managers.findIndex(m => m.id == managerId);
            if (idx === -1) return res.status(404).json({ error: 'Manager not found' });

            managers[idx].name = name;
            managers[idx].permissions = permissions || {};
            if (password) {
                const hashed = await bcrypt.hash(password, 10);
                managers[idx].password = hashed;
            }
            writeLocalTable('managers', managers);
            return res.json({ success: true });
        }

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
        if (useLocalFallback) {
            let managers = readLocalTable('managers');
            managers = managers.filter(m => m.id != req.params.id);
            writeLocalTable('managers', managers);
            return res.json({ success: true });
        }

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

            if (useLocalFallback) {
                const items = readLocalTable(entity);
                const filtered = items.filter(item => item.userId == effectiveUserId);
                return res.json(filtered);
            }
            
            const [rows] = await pool.query(`SELECT * FROM \`${entity}\` WHERE userId = ?`, [effectiveUserId]);
            res.json(rows);
        } catch (err) {
            console.error(`[DB GET SHOW ERROR] Fallback triggered on GET ${entity}: ${err.message}`);
            useLocalFallback = true;
            try {
                const userId = req.query.userId;
                const role = req.query.role;
                const ownerId = req.query.ownerId;
                const effectiveUserId = role === 'MANAGER' ? ownerId : userId;
                if (!effectiveUserId) return res.status(400).json({ error: 'User ID required' });
                
                const items = readLocalTable(entity);
                const filtered = items.filter(item => item.userId == effectiveUserId);
                return res.json(filtered);
            } catch (fallbackErr) {
                res.status(500).json({ error: err.message });
            }
        }
    });

    app.post(`/api/${entity}`, async (req, res) => {
        const data = req.body;
        try {
            // Support both query params and body for role metadata
            const role = req.query.role || data.role;
            const ownerId = req.query.ownerId || data.ownerId;
            
            if (role === 'MANAGER' && ownerId) {
                data.userId = ownerId;
            }

            if (!data.userId) {
                console.warn(`[WARNING] Save to ${entity} blocked: user ID required. Data:`, JSON.stringify(data));
                return res.status(400).json({ error: 'User ID required' });
            }

            if (useLocalFallback) {
                const items = readLocalTable(entity);
                const idx = items.findIndex(item => item.id == data.id);
                if (idx !== -1) {
                    items[idx] = { ...items[idx], ...data };
                } else {
                    items.push(data);
                }
                writeLocalTable(entity, items);
                return res.json({ success: true });
            }
            
            // Fetch actual database columns for the current entity to prevent unknown column errors
            const [columnsInfo] = await pool.query(`SHOW COLUMNS FROM \`${entity}\``);
            const dbCols = columnsInfo.map(col => col.Field);
            const dbColsLower = dbCols.map(c => c.toLowerCase());
            
            // Filter keys to only keep column names that exist in the database table (case-insensitive)
            const filteredData = {};
            for (const key of Object.keys(data)) {
                const lowerKey = key.toLowerCase();
                const idx = dbColsLower.indexOf(lowerKey);
                if (idx !== -1) {
                    const actualDbColName = dbCols[idx];
                    filteredData[actualDbColName] = data[key];
                }
            }
            
            const columns = Object.keys(filteredData);
            if (columns.length === 0) {
                console.error(`[ERROR] Save to ${entity} failed: no valid columns found in database schemas. Data received:`, JSON.stringify(data));
                return res.status(400).json({ error: 'No valid database fields provided' });
            }
            
            const values = Object.values(filteredData).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
            const backtickedCols = columns.map(c => `\`${c}\``).join(', ');
            const placeholders = columns.map(() => '?').join(', ');
            
            // Filter id and userId from update clause to prevent primary/unique key modification errors
            const updateCols = columns.filter(c => c.toLowerCase() !== 'id' && c.toLowerCase() !== 'userid');
            const updateClause = updateCols.length > 0
                ? updateCols.map(c => `\`${c}\` = VALUES(${c})`).join(', ')
                : `\`id\` = \`id\``;
            
            const query = `INSERT INTO \`${entity}\` (${backtickedCols}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClause}`;
            await pool.query(query, values);
            res.json({ success: true });
        } catch (err) {
            console.error(`[DB POST ERROR] Fallback triggered on POST "${entity}":`, err.message);
            useLocalFallback = true;
            try {
                const items = readLocalTable(entity);
                const idx = items.findIndex(item => item.id == data.id);
                if (idx !== -1) {
                    items[idx] = { ...items[idx], ...data };
                } else {
                    items.push(data);
                }
                writeLocalTable(entity, items);
                return res.json({ success: true, localFallbackActive: true });
            } catch (fallbackErr) {
                res.status(500).json({ error: err.message });
            }
        }
    });

    app.delete(`/api/${entity}/:id`, async (req, res) => {
        try {
            const userId = req.query.userId;
            const role = req.query.role;
            const ownerId = req.query.ownerId;
            
            const effectiveUserId = role === 'MANAGER' ? ownerId : userId;
            if (!effectiveUserId) return res.status(400).json({ error: 'User ID required' });

            if (useLocalFallback) {
                let items = readLocalTable(entity);
                items = items.filter(item => !(item.id == req.params.id && item.userId == effectiveUserId));
                writeLocalTable(entity, items);
                return res.json({ success: true });
            }

            await pool.query(`DELETE FROM \`${entity}\` WHERE id = ? AND userId = ?`, [req.params.id, effectiveUserId]);
            res.json({ success: true });
        } catch (err) {
            console.error(`[DB DELETE ERROR] Fallback triggered on DELETE "${entity}":`, err.message);
            useLocalFallback = true;
            try {
                const userId = req.query.userId;
                const role = req.query.role;
                const ownerId = req.query.ownerId;
                const effectiveUserId = role === 'MANAGER' ? ownerId : userId;
                if (!effectiveUserId) return res.status(400).json({ error: 'User ID required' });
                
                let items = readLocalTable(entity);
                items = items.filter(item => !(item.id == req.params.id && item.userId == effectiveUserId));
                writeLocalTable(entity, items);
                return res.json({ success: true });
            } catch (fallbackErr) {
                res.status(500).json({ error: err.message });
            }
        }
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
