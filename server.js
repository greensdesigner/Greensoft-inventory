import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Server initialization started...');

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...', reason);
  process.exit(1);
});

async function startServer() {
  try {
    console.log('Setting up Express...');
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(express.json());

    // Health check endpoint for Hostinger to verify server is up
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', uptime: process.uptime() });
    });

    // Database Connection Pool
    console.log('Connecting to database...');
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000 // 10s timeout
    });

    // Initialize Database Tables
    const initDB = async () => {
      try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');

        // Users Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            businessName VARCHAR(255) NOT NULL,
            fullName VARCHAR(255) NOT NULL,
            phoneNumber VARCHAR(20) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            logo TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Inventory Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS inventory (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(255),
            sku VARCHAR(255),
            quantity INT DEFAULT 0,
            unit VARCHAR(50),
            purchasePrice DECIMAL(10, 2),
            sellingPrice DECIMAL(10, 2),
            minStock INT DEFAULT 0,
            supplier VARCHAR(255),
            lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);

        // Sales Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS sales (
            id VARCHAR(255) PRIMARY KEY,
            invoiceNo VARCHAR(255),
            customerName VARCHAR(255),
            date DATETIME,
            totalAmount DECIMAL(10, 2),
            paidAmount DECIMAL(10, 2),
            paymentMethod VARCHAR(50),
            status VARCHAR(50),
            items JSON
          )
        `);

        console.log('Database tables ready');
        connection.release();
      } catch (error) {
        console.error('Error during database initialization:', error.message);
      }
    };

    await initDB();

    // API Routes

    // Auth APIs
    app.post('/api/auth/register', async (req, res) => {
      try {
        const { businessName, fullName, phoneNumber, email, password } = req.body;
        const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
          return res.status(400).json({ error: 'User already exists with this email' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
          'INSERT INTO users (businessName, fullName, phoneNumber, email, password) VALUES (?, ?, ?, ?, ?)',
          [businessName, fullName, phoneNumber, email, hashedPassword]
        );
        res.status(201).json({ 
          success: true, 
          user: { id: result.insertId, email, businessName, name: fullName, phone: phoneNumber } 
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/auth/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.json({
          success: true,
          user: { id: user.id, email: user.email, businessName: user.businessName, name: user.fullName, phone: user.phoneNumber, logo: user.logo }
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Inventory APIs
    app.get('/api/inventory', async (req, res) => {
      try {
        const [rows] = await pool.query('SELECT * FROM inventory');
        res.json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/inventory', async (req, res) => {
      try {
        const item = req.body;
        await pool.query(
          'INSERT INTO inventory (id, name, category, sku, quantity, unit, purchasePrice, sellingPrice, minStock, supplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [item.id, item.name, item.category, item.sku, item.quantity, item.unit, item.purchasePrice, item.sellingPrice, item.minStock, item.supplier]
        );
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Sales APIs
    app.get('/api/sales', async (req, res) => {
      try {
        const [rows] = await pool.query('SELECT * FROM sales');
        res.json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/sales', async (req, res) => {
      try {
        const sale = req.body;
        await pool.query(
          'INSERT INTO sales (id, invoiceNo, customerName, date, totalAmount, paidAmount, paymentMethod, status, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [sale.id, sale.invoiceNo, sale.customerName, sale.date, sale.totalAmount, sale.paidAmount, sale.paymentMethod, sale.status, JSON.stringify(sale.items)]
        );
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API Route to test DB connection
    app.get('/api/db-check', async (req, res) => {
      try {
        if (!pool) throw new Error('Database pool not initialized');
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        res.json({ status: 'connected', message: 'Successfully connected to Hostinger database!' });
      } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
      }
    });

    // Start listening immediately to prevent 503 errors
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is LIVE on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV);
      
      // Initialize DB after server is already listening
      initDB().catch(err => console.error('Delayed DB Init Error:', err));
    });

    // Vite or Static serving
    if (process.env.NODE_ENV !== 'production') {
      console.log('Running in Development mode with Vite...');
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      console.log('Running in Production mode serving static files...');
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

  } catch (error) {
    console.error('CRITICAL STARTUP ERROR:', error);
  }
}

startServer();
