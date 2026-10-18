const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, comments, totalComments: comments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:postId/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comment = await Comment.create({
      content: content.trim(),
      post: req.params.postId,
      author: req.user._id,
    });

    const populated = await Comment.findById(comment._id).populate('author', 'name email avatar');
    res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private (Comment author only)
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden. You can only edit your own comments.' });
    }

    comment.content = content.trim();
    comment.updatedAt = Date.now();
    await comment.save();

    const populated = await Comment.findById(comment._id).populate('author', 'name email avatar');
    res.status(200).json({ success: true, comment: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Comment author OR Post author)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    const post = await Post.findById(comment.post);
    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostAuthor = post && post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only the comment author or the post author can delete this comment.',
      });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Comment removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getComments, addComment, updateComment, deleteComment };
