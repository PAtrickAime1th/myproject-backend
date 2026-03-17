// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'secret123'; // use a strong secret in production

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await executeQuery('SELECT * FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await executeQuery(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    const user = { id: result.insertId, username };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '2h' });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registering user', message: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const rows = await executeQuery('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(400).json({ error: 'Invalid username or password' });

    const userRow = rows[0];
    const match = await bcrypt.compare(password, userRow.password);
    if (!match) return res.status(400).json({ error: 'Invalid username or password' });

    const user = { id: userRow.id, username: userRow.username };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '2h' });

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error logging in', message: err.message });
  }
});

module.exports = router;