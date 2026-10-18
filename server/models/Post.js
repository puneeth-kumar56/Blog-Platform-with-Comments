const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      minlength: [5, 'Post title must be at least 5 characters long'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      minlength: [20, 'Post content must be at least 20 characters long'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    readTime: {
      type: Number,
      default: 3,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for category and date sorting
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ title: 'text', content: 'text' });

// Cascade delete comments when a post is removed
postSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    const Comment = mongoose.model('Comment');
    await Comment.deleteMany({ post: doc._id });
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
