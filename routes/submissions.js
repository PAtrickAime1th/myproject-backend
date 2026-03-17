const express = require('express');
const router = express.Router();
const { executeQuery } = require('../db/connection');

// Submit quiz answers
router.post('/', async (req, res) => {
  const { quiz_id, answers, user_id } = req.body; // user_id must come from auth

  try {
    // 1️⃣ Calculate score
    let score = 0;

    for (const [questionId, selectedOptionId] of Object.entries(answers)) {
      const optionRows = await executeQuery(
        'SELECT is_correct FROM options WHERE id = ? AND question_id = ?',
        [selectedOptionId, questionId]
      );
      if (optionRows.length && optionRows[0].is_correct) score += 1;
    }

    // 2️⃣ Save submission
    const result = await executeQuery(
      'INSERT INTO submissions (user_id, quiz_id, answers, score) VALUES (?, ?, ?, ?)',
      [user_id, quiz_id, JSON.stringify(answers), score]
    );

    // 3️⃣ Save attempt
    await executeQuery(
      'INSERT INTO attempts (user_id, quiz_id, score) VALUES (?, ?, ?)',
      [user_id, quiz_id, score]
    );

    res.json({ submissionId: result.insertId, score });

  } catch (err) {
    res.status(500).json({ error: 'Error submitting quiz', message: err.message });
  }
});

module.exports = router;