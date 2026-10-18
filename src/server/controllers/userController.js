import { db } from '../db.js';

// @desc    Get user public profile information
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.users.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
      return;
    }

    const { posts } = await db.posts.find({ authorId: id });
    const { password: _, ...safeUser } = user;

    res.status(200).json({
      success: true,
      user: {
        ...safeUser,
        postsCount: posts.length,
      },
    });
  } catch (error) {
    console.error('[UserController.getUserProfile] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.',
    });
  }
};

// @desc    Get posts written by a specific user
// @route   GET /api/users/:id/posts
// @access  Public
export const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.users.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    const { posts, total } = await db.posts.find({
      authorId: id,
      limit: 100,
    });

    res.status(200).json({
      success: true,
      posts,
      totalPosts: total,
      author: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error('[UserController.getUserPosts] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load posts by this user.',
    });
  }
};
