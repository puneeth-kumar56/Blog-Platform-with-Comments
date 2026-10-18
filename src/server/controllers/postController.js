import { db } from '../db.js';

// @desc    Get all blog posts with search, category filtering, sorting, and pagination
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 9));
    const search = req.query.search || '';
    const category = req.query.category || '';
    const sort = req.query.sort || 'newest';

    const skip = (page - 1) * limit;

    const { posts, total } = await db.posts.find({
      search,
      category,
      sort,
      skip,
      limit,
    });

    const categories = await db.posts.getCategories();
    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      posts,
      totalPosts: total,
      totalPages,
      currentPage: page,
      categories: ['All', ...categories],
    });
  } catch (error) {
    console.error('[PostController.getPosts] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve blog posts.',
    });
  }
};

// @desc    Get a single blog post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await db.posts.findById(id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
      return;
    }

    const { posts: categoryPosts } = await db.posts.find({
      category: post.category,
      limit: 4,
    });
    const relatedPosts = categoryPosts.filter((p) => p._id !== post._id).slice(0, 3);

    res.status(200).json({
      success: true,
      post,
      relatedPosts,
    });
  } catch (error) {
    console.error('[PostController.getPostById] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load post details.',
    });
  }
};

// @desc    Create a new blog post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
      return;
    }

    const { title, content, category, coverImage, tags } = req.body;

    if (!title || title.trim().length < 5) {
      res.status(400).json({
        success: false,
        message: 'Post title must be at least 5 characters long.',
      });
      return;
    }

    if (!content || content.trim().length < 20) {
      res.status(400).json({
        success: false,
        message: 'Post content must be at least 20 characters long.',
      });
      return;
    }

    if (!category || category.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please choose or provide a category for your post.',
      });
      return;
    }

    let processedTags = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof tags === 'string' && tags.trim()) {
      processedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (processedTags.length === 0) {
      processedTags = [category.trim()];
    }

    const newPost = await db.posts.create({
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      coverImage: coverImage && coverImage.trim() ? coverImage.trim() : undefined,
      tags: processedTags,
      author: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully!',
      post: newPost,
    });
  } catch (error) {
    console.error('[PostController.createPost] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog post.',
    });
  }
};

// @desc    Update an existing blog post
// @route   PUT /api/posts/:id
// @access  Private (Author only)
export const updatePost = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
      return;
    }

    const { id } = req.params;
    const post = await db.posts.findById(id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
      return;
    }

    if (post.author._id.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to edit this post. Only the original author can edit it.',
      });
      return;
    }

    const { title, content, category, coverImage, tags } = req.body;

    if (title && title.trim().length < 5) {
      res.status(400).json({
        success: false,
        message: 'Post title must be at least 5 characters long.',
      });
      return;
    }

    if (content && content.trim().length < 20) {
      res.status(400).json({
        success: false,
        message: 'Post content must be at least 20 characters long.',
      });
      return;
    }

    let processedTags;
    if (Array.isArray(tags)) {
      processedTags = tags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof tags === 'string' && tags.trim()) {
      processedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const updated = await db.posts.findByIdAndUpdate(id, {
      title: title ? title.trim() : undefined,
      content: content ? content.trim() : undefined,
      category: category ? category.trim() : undefined,
      coverImage: coverImage ? coverImage.trim() : undefined,
      tags: processedTags,
    });

    res.status(200).json({
      success: true,
      message: 'Post updated successfully!',
      post: updated,
    });
  } catch (error) {
    console.error('[PostController.updatePost] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog post.',
    });
  }
};

// @desc    Delete a blog post (and cascade delete comments)
// @route   DELETE /api/posts/:id
// @access  Private (Author only)
export const deletePost = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
      return;
    }

    const { id } = req.params;
    const post = await db.posts.findById(id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
      return;
    }

    if (post.author._id.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to delete this post. Only the original author can delete it.',
      });
      return;
    }

    await db.posts.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Blog post and all associated comments deleted successfully.',
    });
  } catch (error) {
    console.error('[PostController.deletePost] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog post.',
    });
  }
};

// @desc    Get posts written by current logged-in user
// @route   GET /api/posts/my-posts
// @access  Private
export const getMyPosts = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
      return;
    }

    const { posts, total } = await db.posts.find({
      authorId: req.user._id,
      limit: 100,
    });

    res.status(200).json({
      success: true,
      posts,
      totalPosts: total,
    });
  } catch (error) {
    console.error('[PostController.getMyPosts] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load your posts.',
    });
  }
};
