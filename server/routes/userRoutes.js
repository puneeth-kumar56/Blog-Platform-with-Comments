const express = require('express');
const { getUserProfile, getUserPosts } = require('../controllers/userController');

const router = express.Router();

router.get('/:id', getUserProfile);
router.get('/:id/posts', getUserPosts);

module.exports = router;
