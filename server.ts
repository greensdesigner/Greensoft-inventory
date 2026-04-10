import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'greensoft-secret-key';
const DB_PATH = path.join(process.cwd(), 'db.json');

// Initialize local DB if not exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
}

const readLocalDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeLocalDB = (data: any) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// --- MYSQL CONFIGURATION ---
const isMySQLConfigured = () => {
  const host = process.env.DB_HOST;
  return !!(host && host.length > 0 && host !== 'your-host' && process.env.DB_USER && process.env.DB_NAME);
};

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
  connectTimeout: 2000, // Reduced to 2 seconds for faster fallback
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
};

let pool: mysql.Pool | null = null;
let mysqlAvailable = false;

function getPool() {
  if (!pool && isMySQLConfigured()) {
    try {
      pool = mysql.createPool(dbConfig);
    } catch (err) {
      console.error('Failed to create MySQL pool:', err);
      pool = null;
    }
  }
  return pool;
}

// Initialize Database Table
async function initDB() {
  if (!isMySQLConfigured()) {
    mysqlAvailable = false;
    return;
  }
  try {
    const p = getPool();
    if (p) {
      // Fast connection test
      const conn = await p.getConnection();
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS users (
          uid VARCHAR(50) PRIMARY KEY,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          businessName VARCHAR(100),
          fullName VARCHAR(100),
          phoneNumber VARCHAR(20),
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      conn.release();
      mysqlAvailable = true;
      console.log('MySQL Database ready.');
    }
  } catch (err) {
    console.error('MySQL not reachable, using local DB.');
    mysqlAvailable = false;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Run initDB in background to not block server start
  initDB();

  // --- API ROUTES ---

  // Sign Up
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, businessName, fullName, phone } = req.body;
    
    try {
      const uid = Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(password, 10);
      const createdAt = new Date();

      let useMySQL = false;
      const p = getPool();

      if (mysqlAvailable && p) {
        try {
          const [existing]: any = await p.execute('SELECT uid FROM users WHERE email = ? LIMIT 1', [email]);
          if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
          }

          await p.execute(
            'INSERT INTO users (uid, email, password, businessName, fullName, phoneNumber, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uid, email, hashedPassword, businessName, fullName, phone, createdAt]
          );
          useMySQL = true;
        } catch (dbErr) {
          console.error('MySQL Error, falling back:', dbErr);
          useMySQL = false;
          mysqlAvailable = false; // Disable for future requests to save time
        }
      }

      if (!useMySQL) {
        const db = readLocalDB();
        if (db.users.find((u: any) => u.email === email)) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        db.users.push({ uid, email, password: hashedPassword, businessName, fullName, phoneNumber: phone, createdAt: createdAt.toISOString() });
        writeLocalDB(db);
      }

      const token = jwt.sign({ uid }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('auth_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ uid, email, businessName, fullName, phoneNumber: phone, isDemo: !useMySQL });
    } catch (err: any) {
      res.status(500).json({ message: 'Signup failed. Please try again.' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
      let user: any = null;
      let useMySQL = false;
      const p = getPool();

      if (mysqlAvailable && p) {
        try {
          const [rows]: any = await p.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
          user = rows[0];
          useMySQL = true;
        } catch (dbErr) {
          useMySQL = false;
          mysqlAvailable = false;
        }
      }

      if (!useMySQL) {
        const db = readLocalDB();
        user = db.users.find((u: any) => u.email === email);
      }

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ uid: user.uid }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('auth_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

      const { password: _, ...userProfile } = user;
      res.json({ ...userProfile, isDemo: !useMySQL });
    } catch (err: any) {
      res.status(500).json({ message: 'Login failed.' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out' });
  });

  // Get Current User
  app.get('/api/auth/me', async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { uid: string };
      const p = getPool();
      let user: any = null;

      if (p) {
        const [rows]: any = await p.execute('SELECT * FROM users WHERE uid = ?', [decoded.uid]);
        user = rows[0];
      } else {
        const db = readLocalDB();
        user = db.users.find((u: any) => u.uid === decoded.uid);
      }
      
      if (!user) return res.status(401).json({ message: 'User not found' });

      const { password: _, ...userProfile } = user;
      res.json({ ...userProfile, isDemo: !p });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // --- VITE MIDDLEWARE ---
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
