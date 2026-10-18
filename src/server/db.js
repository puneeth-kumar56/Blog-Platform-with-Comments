import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'blog_database.json');

let dbInstance = null;
let isMongoConnected = false;

// Attempt optional real MongoDB connection if MONGODB_URI is provided
export async function initDatabaseConnection() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && mongoUri.startsWith('mongodb')) {
    try {
      console.log(`[Database] Attempting connection to MongoDB: ${mongoUri.replace(/:([^:@]{1,})@/, ':****@')}`);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      isMongoConnected = true;
      console.log('[Database] Connected to MongoDB successfully.');
    } catch (err) {
      console.warn('[Database] MongoDB connection failed or offline. Utilizing persistent storage mode.');
      isMongoConnected = false;
    }
  } else {
    console.log('[Database] Running in persistent JSON storage mode.');
  }

  loadDatabase();
}

export function isMongoDBLive() {
  return isMongoConnected && mongoose.connection.readyState === 1;
}

function loadDatabase() {
  if (dbInstance) return dbInstance;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      dbInstance = JSON.parse(raw);
      return dbInstance;
    }
  } catch (err) {
    console.error('[Database] Failed to read database file, seeding new database:', err);
  }

  dbInstance = seedInitialData();
  saveDatabase();
  return dbInstance;
}

export function saveDatabase() {
  if (!dbInstance) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbInstance, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Database] Error saving database file:', err);
  }
}

function seedInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Password123!', salt);

  const users = [
    {
      _id: 'user_alex_101',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: passwordHash,
      bio: 'Full-stack software architect focusing on high-scale distributed systems and JavaScript.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date('2026-01-15T09:00:00Z').toISOString(),
    },
    {
      _id: 'user_sarah_102',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      password: passwordHash,
      bio: 'Design systems advocate, frontend engineer, and open source enthusiast.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date('2026-02-01T11:30:00Z').toISOString(),
    },
    {
      _id: 'user_marcus_103',
      name: 'Marcus Vance',
      email: 'marcus@example.com',
      password: passwordHash,
      bio: 'Cloud infra engineer, security researcher, and database optimization specialist.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date('2026-02-20T14:15:00Z').toISOString(),
    },
  ];

  const posts = [
    {
      _id: 'post_1001',
      title: 'Modern Full-Stack Architecture with MERN: Patterns & Best Practices',
      content: `Developing scalable web applications demands a clear separation of concerns, defensive programming, and rigorous data consistency across the stack.

### 1. Unified Contracts
By declaring structured schemas for requests and responses, frontend React components and Express controllers share a single source of truth.

### 2. Authentication and Security
Bearer tokens inside authorization headers provide seamless cross-domain support and microservice forwarding. Using standard JWT with tight expiration periods balances usability and security.

### 3. Cascading Cleanups in NoSQL
MongoDB provides remarkable flexibility, but document relationships require deliberate lifecycle management. When deleting parent records such as blog posts, always ensure associated child records (like comments) are removed.

With careful planning, the MERN stack delivers unparalleled developer velocity and user experience.`,
      author: {
        _id: users[0]._id,
        name: users[0].name,
        email: users[0].email,
        avatar: users[0].avatar,
      },
      category: 'Web Development',
      coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
      tags: ['MERN', 'React', 'NodeJS', 'MongoDB', 'Architecture'],
      readTime: 5,
      likesCount: 38,
      commentsCount: 2,
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    {
      _id: 'post_1002',
      title: 'Designing Intuitive Developer Experience in Modern Web Applications',
      content: `Developer Experience (DX) is directly reflected in the final user experience (UX). When engineering teams operate with predictable state management and crystal-clear feedback loops, product quality soars.

### Principles of First-Class UI Feedback
* **Predictable Loading States:** Never leave users guessing whether an action registered.
* **Granular Error Handling:** Instead of opaque "Something went wrong" messages, return actionable diagnostic messages.
* **Optimistic Updates:** Immediate visual confirmation makes web apps feel lightning-fast.`,
      author: {
        _id: users[1]._id,
        name: users[1].name,
        email: users[1].email,
        avatar: users[1].avatar,
      },
      category: 'Design',
      coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
      tags: ['UX', 'Frontend', 'DesignSystems', 'Accessibility'],
      readTime: 4,
      likesCount: 24,
      commentsCount: 1,
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
    {
      _id: 'post_1003',
      title: 'The Pragmatic Guide to Database Indexing and Query Optimization',
      content: `As document databases grow into millions of records, single-field and compound indexes become vital to prevent full collection table scans.

### Essential MongoDB Indexing Tips:
1. **Index Query Filters & Sort Keys:** For queries filtering by category and sorting by date, create compound indexes.
2. **Text Search Indexes:** Utilize text indexes on title and content for quick keyword matches.
3. **Sparse Indexes:** Use sparse indexes for fields that only exist on a subset of documents.`,
      author: {
        _id: users[2]._id,
        name: users[2].name,
        email: users[2].email,
        avatar: users[2].avatar,
      },
      category: 'Technology',
      coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80',
      tags: ['MongoDB', 'Performance', 'Database', 'Indexing'],
      readTime: 6,
      likesCount: 42,
      commentsCount: 1,
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    },
  ];

  const comments = [
    {
      _id: 'comment_2001',
      content: 'Terrific breakdown of MERN architecture! The cascade delete pattern in Mongoose hooks is something many developers overlook when dealing with orphaned comments.',
      author: {
        _id: users[1]._id,
        name: users[1].name,
        email: users[1].email,
        avatar: users[1].avatar,
      },
      post: 'post_1001',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
    {
      _id: 'comment_2002',
      content: 'Great UX insights Sarah! Optimistic UI combined with graceful fallback when requests fail makes the whole platform feel snappy.',
      author: {
        _id: users[0]._id,
        name: users[0].name,
        email: users[0].email,
        avatar: users[0].avatar,
      },
      post: 'post_1002',
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    },
  ];

  return { users, posts, comments };
}

// Data Access Object
export const db = {
  users: {
    find: async () => {
      const db = loadDatabase();
      return db.users;
    },
    findById: async (id) => {
      const db = loadDatabase();
      const user = db.users.find((u) => u._id === id);
      return user ? { ...user } : null;
    },
    findOne: async (query) => {
      const db = loadDatabase();
      if (query.email) {
        const u = db.users.find((x) => x.email.toLowerCase() === query.email.toLowerCase());
        return u ? { ...u } : null;
      }
      if (query._id) {
        const u = db.users.find((x) => x._id === query._id);
        return u ? { ...u } : null;
      }
      return null;
    },
    create: async (userData) => {
      const db = loadDatabase();
      const newUser = {
        _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: userData.name || '',
        email: userData.email || '',
        password: userData.password || '',
        bio: userData.bio || 'Blogger & developer',
        avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name || 'User')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      saveDatabase();
      return newUser;
    },
  },

  posts: {
    find: async (options = {}) => {
      const database = loadDatabase();
      let filtered = [...database.posts];

      filtered = filtered.map((post) => ({
        ...post,
        commentsCount: database.comments.filter((c) => c.post === post._id).length,
      }));

      if (options.search && options.search.trim() !== '') {
        const query = options.search.toLowerCase().trim();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.content.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            (p.tags && p.tags.some((t) => t.toLowerCase().includes(query)))
        );
      }

      if (options.category && options.category !== 'All' && options.category.trim() !== '') {
        filtered = filtered.filter(
          (p) => p.category.toLowerCase() === options.category.toLowerCase()
        );
      }

      if (options.authorId) {
        filtered = filtered.filter((p) => p.author._id === options.authorId);
      }

      if (options.sort === 'oldest') {
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (options.sort === 'popular') {
        filtered.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      } else {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const total = filtered.length;
      const skip = options.skip || 0;
      const limit = options.limit || 50;
      const paginated = filtered.slice(skip, skip + limit);

      return { posts: paginated, total };
    },

    findById: async (id) => {
      const database = loadDatabase();
      const post = database.posts.find((p) => p._id === id);
      if (!post) return null;

      const commentsCount = database.comments.filter((c) => c.post === post._id).length;
      return { ...post, commentsCount };
    },

    create: async (postData) => {
      const database = loadDatabase();
      const readTime = Math.max(1, Math.ceil(postData.content.split(/\s+/).length / 200));

      const newPost = {
        _id: 'post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title: postData.title,
        content: postData.content,
        category: postData.category || 'General',
        coverImage: postData.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
        tags: postData.tags || [postData.category || 'General'],
        author: postData.author,
        readTime,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      database.posts.unshift(newPost);
      saveDatabase();
      return newPost;
    },

    findByIdAndUpdate: async (id, updates) => {
      const database = loadDatabase();
      const index = database.posts.findIndex((p) => p._id === id);
      if (index === -1) return null;

      const current = database.posts[index];
      const newContent = updates.content !== undefined ? updates.content : current.content;
      const readTime = Math.max(1, Math.ceil(newContent.split(/\s+/).length / 200));

      database.posts[index] = {
        ...current,
        ...updates,
        readTime,
        updatedAt: new Date().toISOString(),
      };

      saveDatabase();
      return database.posts[index];
    },

    findByIdAndDelete: async (id) => {
      const database = loadDatabase();
      const initialLength = database.posts.length;
      database.posts = database.posts.filter((p) => p._id !== id);

      if (database.posts.length === initialLength) {
        return false;
      }

      // Cascade delete associated comments
      database.comments = database.comments.filter((c) => c.post !== id);
      saveDatabase();
      return true;
    },

    getCategories: async () => {
      const database = loadDatabase();
      const set = new Set();
      database.posts.forEach((p) => {
        if (p.category) set.add(p.category);
      });
      return Array.from(set).sort();
    },
  },

  comments: {
    findByPost: async (postId) => {
      const database = loadDatabase();
      return database.comments
        .filter((c) => c.post === postId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    findById: async (id) => {
      const database = loadDatabase();
      const comment = database.comments.find((c) => c._id === id);
      return comment ? { ...comment } : null;
    },

    create: async (data) => {
      const database = loadDatabase();
      const newComment = {
        _id: 'comment_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        content: data.content,
        post: data.post,
        author: data.author,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      database.comments.unshift(newComment);

      const post = database.posts.find((p) => p._id === data.post);
      if (post) {
        post.commentsCount = database.comments.filter((c) => c.post === data.post).length;
      }

      saveDatabase();
      return newComment;
    },

    findByIdAndUpdate: async (id, content) => {
      const database = loadDatabase();
      const index = database.comments.findIndex((c) => c._id === id);
      if (index === -1) return null;

      database.comments[index].content = content;
      database.comments[index].updatedAt = new Date().toISOString();

      saveDatabase();
      return database.comments[index];
    },

    findByIdAndDelete: async (id) => {
      const database = loadDatabase();
      const target = database.comments.find((c) => c._id === id);
      if (!target) return false;

      const postId = target.post;
      database.comments = database.comments.filter((c) => c._id !== id);

      const post = database.posts.find((p) => p._id === postId);
      if (post) {
        post.commentsCount = database.comments.filter((c) => c.post === postId).length;
      }

      saveDatabase();
      return true;
    },
  },
};
