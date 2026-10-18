# DevScribe — Full-Stack MERN Blogging Platform with Comments

A modern, responsive, production-grade blogging platform developed using the **MERN** stack (MongoDB, Express.js, React.js, and Node.js). Features secure JSON Web Token (JWT) authentication, password hashing with bcrypt, full CRUD for blog posts, search and category filtering, author-only permissions, interactive commenting with post-author moderation, and cascading document cleanup.

---

## 1. Tech Stack Overview

* **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Axios, React Context API.
* **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), bcryptjs, CORS, Helmet.
* **Database:** MongoDB with Mongoose ODM (includes automatic embedded persistent fallback mode when running standalone).

---

## 2. Key Features

### A. Authentication & User Management
* **User Registration:** Name, email, password (min 6 chars), optional bio and avatar.
* **Password Hashing:** Passwords hashed with bcrypt (10 salt rounds) before persistence.
* **JWT Tokens:** Authenticated sessions signed with secret key; transmitted in `Authorization: Bearer <token>` headers.
* **Protected Routes:** Unauthorized users cannot create, edit, or delete articles or post comments.
* **User Profile Page:** Displays author biography, registration date, and all authored articles.

### B. Blog Post Management
* **Create Post:** Title, content, category (presets or custom), cover image URL, and tags.
* **Explore Feed:** View all published articles sorted by newest first, oldest first, or most liked.
* **Search & Filters:** Real-time search across post titles, content, and tags; category pills filter.
* **Edit Post:** Original authors can update title, content, category, and cover image.
* **Delete Post:** Authors can delete articles; triggers **cascading deletion** of all associated comments.
* **My Posts:** Private dashboard displaying articles written by the current user with metrics.

### C. Comment System & Moderation
* **Add Comments:** Authenticated users can comment on any post.
* **Edit Comment:** Comment authors can edit their comment content inline.
* **Delete Comment (Dual Permission):**
  1. The **comment author** can delete their own comment.
  2. The **post author** can delete inappropriate or off-topic comments on their own article.
* **Validation:** Prevents empty comments.
* **Orphan Prevention:** Deleting a post automatically cleans up all associated comments.

---

## 3. Windows & VS Code Installation Guide

Follow these step-by-step instructions in Windows 11/10 and Visual Studio Code:

### Step 1: Install Node.js
1. Visit [nodejs.org](https://nodejs.org/) and download the **LTS installer** (Windows x64 .msi).
2. Run the installer and accept default options.
3. Verify in Windows PowerShell:
   ```powershell
   node -v
   npm -v
   ```

### Step 2: Configure MongoDB
Choose **Option A** (Cloud - recommended) or **Option B** (Local):

* **Option A (MongoDB Atlas Cloud - Free):**
  1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
  2. Create a free **M0 Sandbox** cluster.
  3. Under **Database Access**, create a user (e.g. `devadmin` with a strong password).
  4. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere).
  5. Click **Connect -> Drivers** and copy your URI:
     `mongodb+srv://devadmin:<password>@cluster0.abcde.mongodb.net/blog_platform?retryWrites=true&w=majority`

* **Option B (Local MongoDB on Windows):**
  1. Download **MongoDB Community Server** from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
  2. Install as a "Windows Service". The default connection string is `mongodb://localhost:27017/blog_platform`.

### Step 3: Open Project in VS Code
1. Open Visual Studio Code.
2. Select **File -> Open Folder...** and select the `blog-platform` directory.
3. Open the integrated terminal with ``Ctrl + ` ``.

### Step 4: Install Dependencies & Run
This project can be run in two ways:

#### Method 1: Unified Full-Stack Server (Recommended - Easiest & Fastest)
Express serves both the REST API on `/api/*` and mounts the Vite frontend on port 3000:
```powershell
# 1. Install all dependencies
npm install

# 2. Copy environment file
Copy-Item .env.example .env

# 3. Start the application
npm run dev
```
Open **http://localhost:3000** in your browser.

#### Method 2: Split Client & Server
If you prefer running the Express backend and React frontend in separate terminal windows:
```powershell
# Terminal 1 (Backend):
cd server
npm install
node server.js

# Terminal 2 (Frontend):
npm install
npm run dev
```

---

## 4. RESTful API Documentation

Base URL: `http://localhost:3000/api`

### Authentication Endpoints
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new account (`name`, `email`, `password`, `bio`) |
| `POST` | `/api/auth/login` | Public | Login with email and password, returns JWT token |
| `GET` | `/api/auth/me` | Private | Returns currently logged-in user profile |

### Blog Post Endpoints
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | Public | List posts (params: `search`, `category`, `sort`, `page`, `limit`) |
| `GET` | `/api/posts/:id` | Public | Get single post details and related articles |
| `POST` | `/api/posts` | Private | Create new post (`title`, `content`, `category`, `coverImage`, `tags`) |
| `PUT` | `/api/posts/:id` | Private (Author) | Update post (`title`, `content`, `category`, etc.) |
| `DELETE` | `/api/posts/:id` | Private (Author) | Delete post and cascade delete its comments |
| `GET` | `/api/posts/my-posts` | Private | Get all posts authored by logged-in user |

### Comment Endpoints
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts/:postId/comments` | Public | Get comments for a post |
| `POST` | `/api/posts/:postId/comments` | Private | Add comment to a post (`content`) |
| `PUT` | `/api/comments/:id` | Private (Comment Author) | Edit comment content |
| `DELETE` | `/api/comments/:id` | Private (Comment Author OR Post Author) | Delete comment |

### User Profile Endpoints
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/:id` | Public | Get public author profile |
| `GET` | `/api/users/:id/posts` | Public | Get articles authored by specific user |

---

## 5. Working Process & Architectural Flow

```
[React Client] ────(Axios + Bearer JWT)────> [Express Router]
                                                    │
                                            [authMiddleware]
                                          (verify JWT signature)
                                                    │
                                            [Controllers]
                                                    │
                                            [Mongoose Models]
                                                    │
                                          [MongoDB / Atlas]
```

1. **Registration:** React sends POST with name, email, password -> Express validates -> bcrypt hashes password with 10 salt rounds -> MongoDB persists user -> signed JWT returned.
2. **Post Management:** Protected routes verify JWT -> `req.user` attached -> Post is saved referencing `author: req.user._id`.
3. **Cascading Comment Deletion:** When a post is deleted via `DELETE /api/posts/:id`, the controller calls:
   ```javascript
   await Post.findByIdAndDelete(req.params.id);
   await Comment.deleteMany({ post: req.params.id });
   ```
   Ensuring zero orphaned comments ever remain in the database.

---

## 6. Testing Checklist

- [x] **User Registration:** Create account, check unique email, verify JWT stored.
- [x] **Duplicate Email Check:** Attempt registering existing email -> receives 400 error.
- [x] **Authentication Flow:** Successful login, invalid credential rejection.
- [x] **Route Protection:** Unauthenticated users cannot post or access `/my-posts`.
- [x] **Post CRUD:** Author can create, view, edit, and delete their own posts.
- [x] **Ownership Guards:** Non-authors receive 403 Forbidden when attempting to edit/delete.
- [x] **Comment System:** Users can add and edit comments.
- [x] **Post Author Moderation:** Post author can remove inappropriate comments on their articles.
- [x] **Cascading Cleanup:** Deleting a post removes all its comments.
- [x] **Search & Filters:** Search by title/keywords and filter by category in real-time.
- [x] **Session Persistence:** Refreshing page keeps user logged in via token in localStorage.

---

## 7. License
MIT License. Built for full-stack engineering education and production blogging.
