const express = require('express');
const router = express.Router();
const { executeQuery } = require('../db/connection');

// Record an attempt for a question
router.post('/', async (req, res) => {
  const { user_id, question_id, selected_option_id, is_correct } = req.body;

  try {
    const result = await executeQuery(
      `INSERT INTO attempts (user_id, question_id, selected_option_id, is_correct)
       VALUES (?, ?, ?, ?)`,
      [user_id, question_id, selected_option_id, is_correct]
    );

    res.status(201).json({
      attempt_id: result.insertId,
      user_id,
      question_id,
      selected_option_id,
      is_correct
    });
  } catch (err) {
    res.status(500).json({ error: 'Error recording attempt', message: err.message });
  }
});

// Get all attempts for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const rows = await executeQuery(
      `SELECT a.*, q.question_text, o.option_text 
       FROM attempts a
       JOIN questions q ON a.question_id = q.id
       JOIN options o ON a.selected_option_id = o.id
       WHERE a.user_id = ?`,
      [req.params.userId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching attempts', message: err.message });
  }
});

module.exports = router;