const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const sort = req.query.sort || 'newest';

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'popular') sortOptions = { likesCount: -1 };

    const skip = (page - 1) * limit;
    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name email avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const categories = await Post.distinct('category');

    res.status(200).json({
      success: true,
      posts,
      totalPosts: total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      categories: ['All', ...categories],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email avatar bio');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const relatedPosts = await Post.find({
      category: post.category,
      _id: { $ne: post._id },
    })
      .select('title category readTime author')
      .populate('author', 'name')
      .limit(3);

    res.status(200).json({ success: true, post, relatedPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content, category, coverImage, tags } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ success: false, message: 'Please provide title, content, and category.' });
    }

    const post = await Post.create({
      title,
      content,
      category,
      coverImage: coverImage || '',
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t) => t.trim()).filter(Boolean),
      author: req.user._id,
      readTime: Math.max(1, Math.ceil(content.split(/\s+/).length / 200)),
    });

    const populated = await Post.findById(post._id).populate('author', 'name email avatar');
    res.status(201).json({ success: true, post: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (Author only)
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden. Only the author can edit this post.' });
    }

    const { title, content, category, coverImage, tags } = req.body;
    if (title) post.title = title;
    if (content) {
      post.content = content;
      post.readTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
    }
    if (category) post.category = category;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (tags) post.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean);
    post.updatedAt = Date.now();

    const updatedPost = await post.save();
    const populated = await Post.findById(updatedPost._id).populate('author', 'name email avatar');

    res.status(200).json({ success: true, post: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a post (and cascade delete comments)
// @route   DELETE /api/posts/:id
// @access  Private (Author only)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden. Only the author can delete this post.' });
    }

    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id });

    res.status(200).json({ success: true, message: 'Post and associated comments deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get posts by current user
// @route   GET /api/posts/my-posts
// @access  Private
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts, totalPosts: posts.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
};
