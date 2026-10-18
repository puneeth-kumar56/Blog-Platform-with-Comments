import { Router } from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
} from '../controllers/postController.js';
import {
  getComments,
  addComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Nested comment routes
router.get('/:postId/comments', getComments);
router.post('/:postId/comments', protect, addComment);

// My posts
router.get('/my-posts', protect, getMyPosts);

// Standard post CRUD
router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

export default router;
