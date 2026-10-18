const express = require('express');
const { updateComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/:id')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;
