import { db } from '../db.js';

// @desc    Get comments for a specific post
// @route   GET /api/posts/:postId/comments
// @access  Public
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await db.posts.findById(postId);
    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
      return;
    }

    const comments = await db.comments.findByPost(postId);

    res.status(200).json({
      success: true,
      comments,
      totalComments: comments.length,
    });
  } catch (error) {
    console.error('[CommentController.getComments] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve comments.',
    });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:postId/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
      return;
    }

    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.',
      });
      return;
    }

    const post = await db.posts.findById(postId);
    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Cannot comment on a non-existent blog post.',
      });
      return;
    }

    const newComment = await db.comments.create({
      content: content.trim(),
      post: postId,
      author: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully!',
      comment: newComment,
    });
  } catch (error) {
    console.error('[CommentController.addComment] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment.',
    });
  }
};

// @desc    Edit a comment
// @route   PUT /api/comments/:id
// @access  Private (Comment author only)
export const updateComment = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
      return;
    }

    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.',
      });
      return;
    }

    const comment = await db.comments.findById(id);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
      return;
    }

    if (comment.author._id.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You can only edit your own comments.',
      });
      return;
    }

    const updated = await db.comments.findByIdAndUpdate(id, content.trim());

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully!',
      comment: updated,
    });
  } catch (error) {
    console.error('[CommentController.updateComment] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment.',
    });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Comment author OR Post author)
export const deleteComment = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
      return;
    }

    const { id } = req.params;
    const comment = await db.comments.findById(id);

    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
      return;
    }

    const isCommentAuthor = comment.author._id.toString() === req.user._id.toString();
    let isPostAuthor = false;

    const post = await db.posts.findById(comment.post);
    if (post && post.author._id.toString() === req.user._id.toString()) {
      isPostAuthor = true;
    }

    if (!isCommentAuthor && !isPostAuthor) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. Only the comment author or the post author can delete this comment.',
      });
      return;
    }

    await db.comments.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: isCommentAuthor
        ? 'Your comment has been deleted.'
        : 'Inappropriate comment removed from your post.',
    });
  } catch (error) {
    console.error('[CommentController.deleteComment] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment.',
    });
  }
};
