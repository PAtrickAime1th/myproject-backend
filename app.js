require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth')); // optional if you have auth
app.use('/api/quizzes', require('./routes/quizzes')); // fetch quizzes with questions/options
app.use('/api/submissions', require('./routes/submissions')); // submit quiz, record attempts

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'healthy' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});