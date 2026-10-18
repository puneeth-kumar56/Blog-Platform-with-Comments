const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get user public profile
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const postsCount = await Post.countDocuments({ author: req.params.id });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
        postsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's published posts
// @route   GET /api/users/:id/posts
// @access  Public
const getUserPosts = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email avatar bio');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const posts = await Post.find({ author: req.params.id })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
      totalPosts: posts.length,
      author: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserProfile, getUserPosts };
