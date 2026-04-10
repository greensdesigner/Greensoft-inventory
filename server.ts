import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Database Connection Pool
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Initialize Database Tables
  const initDB = async () => {
    try {
      const connection = await pool.getConnection();
      
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

      console.log('Database tables initialized');
      connection.release();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  };

  initDB();

  // API Routes
  
  // Inventory APIs
  app.get('/api/inventory', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM inventory');
      res.json(rows);
    } catch (error: any) {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Sales APIs
  app.get('/api/sales', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM sales');
      res.json(rows);
    } catch (error: any) {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route to test DB connection
  app.get('/api/db-check', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      res.json({ status: 'connected', message: 'Successfully connected to Hostinger database!' });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
