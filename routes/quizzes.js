const express = require('express');
const router = express.Router();
const { executeQuery } = require('../db/connection');

// Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await executeQuery('SELECT * FROM quizzes');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching quizzes', message: err.message });
  }
});

// Get single quiz by ID with all questions and options
router.get('/:id', async (req, res) => {
  const quizId = req.params.id;

  try {
    // 1️⃣ Fetch quiz info
    const quizRows = await executeQuery('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    if (quizRows.length === 0) return res.status(404).json({ error: 'Quiz not found' });
    const quiz = quizRows[0];

    // 2️⃣ Fetch all questions with their options in one query
    const questionRows = await executeQuery(
      `SELECT 
         q.id AS question_id, 
         q.text AS question_text,
         o.id AS option_id, 
         o.option_text, 
         o.is_correct
       FROM questions q
       LEFT JOIN options o ON q.id = o.question_id
       WHERE q.quiz_id = ?
       ORDER BY q.id, o.id`,
      [quizId]
    );

    // 3️⃣ Transform flat query into nested structure
    const questionMap = {};
    questionRows.forEach(row => {
      if (!questionMap[row.question_id]) {
        questionMap[row.question_id] = {
          id: row.question_id,
          question_text: row.question_text,
          options: []
        };
      }
      if (row.option_id) {
        questionMap[row.question_id].options.push({
          id: row.option_id,
          option_text: row.option_text,
          is_correct: row.is_correct
        });
      }
    });

    res.json({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questions: Object.values(questionMap)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching quiz', message: err.message });
  }
});

module.exports = router;