import { Router } from 'express';
import { updateComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.route('/:id')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

export default router;
