import React, { useState } from 'react';
import {
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  Play,
  ShieldCheck,
  Layers,
  Database,
  Server,
  Laptop,
  FileCode,
  Key,
} from 'lucide-react';
import { apiClient } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const DocsGuide = () => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('api');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Live API Explorer state
  const [testedEndpoint, setTestedEndpoint] = useState(null);
  const [testResponse, setTestResponse] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const runApiTest = async (method, url, data) => {
    setTestedEndpoint(`${method} ${url}`);
    setTestLoading(true);
    setTestResponse(null);
    setTestStatus(null);
    try {
      let res;
      if (method === 'GET') {
        res = await apiClient.get(url);
      } else {
        res = await apiClient.post(url, data);
      }
      setTestStatus(res.status);
      setTestResponse(res.data);
    } catch (err) {
      setTestStatus(err.response?.status || 500);
      setTestResponse(err.response?.data || { error: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold">
            MERN Stack Complete Reference
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-mono">
            Pure JavaScript (Node.js + Express + React + MongoDB)
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          DevScribe Developer & Setup Documentation
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
          Comprehensive guide for running on Windows in VS Code, configuring MongoDB Atlas,
          testing RESTful endpoints, and auditing full-stack security & cascading deletions.
        </p>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-800/80 mt-6 no-scrollbar">
          {[
            { id: 'api', label: 'Interactive API Explorer', icon: <Terminal className="w-4 h-4" /> },
            { id: 'setup', label: 'Windows & VS Code Setup', icon: <Laptop className="w-4 h-4" /> },
            { id: 'architecture', label: 'Architecture & Flow', icon: <Layers className="w-4 h-4" /> },
            { id: 'models', label: 'Database & Mongoose Models', icon: <Database className="w-4 h-4" /> },
            { id: 'testing', label: 'Testing Checklist', icon: <CheckCircle2 className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: INTERACTIVE API EXPLORER */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              Live REST API Explorer
            </h2>
            <p className="text-xs text-slate-500">
              DevScribe's Express backend is actively mounted on this host. Click "Test Endpoint"
              below to dispatch live HTTP requests and inspect authentic responses, status codes,
              and JSON payloads.
            </p>

            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Key className="w-4 h-4 text-indigo-600" />
                Current Auth Status:{' '}
                {user ? (
                  <strong className="text-indigo-950 font-bold">
                    Authenticated as {user.name} ({user.email})
                  </strong>
                ) : (
                  <strong className="text-slate-600">Guest (Unauthenticated)</strong>
                )}
              </span>
              {token && (
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded text-indigo-700">
                  JWT Attached in Interceptor
                </span>
              )}
            </div>
          </div>

          {/* Endpoints Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                REST Endpoints
              </span>
              <span className="text-xs text-slate-400">12 Routes Configured</span>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                {
                  method: 'GET',
                  endpoint: '/health',
                  desc: 'System health, database status, and uptime',
                  auth: false,
                  action: () => runApiTest('GET', '/health'),
                },
                {
                  method: 'GET',
                  endpoint: '/posts',
                  desc: 'Fetch paginated posts with search and category filters',
                  auth: false,
                  action: () => runApiTest('GET', '/posts?limit=3'),
                },
                {
                  method: 'GET',
                  endpoint: '/posts/my-posts',
                  desc: 'Get posts authored by the authenticated user',
                  auth: true,
                  action: () => runApiTest('GET', '/posts/my-posts'),
                },
                {
                  method: 'GET',
                  endpoint: '/auth/me',
                  desc: 'Verify token and return current user profile',
                  auth: true,
                  action: () => runApiTest('GET', '/auth/me'),
                },
                {
                  method: 'GET',
                  endpoint: '/posts/post_1001/comments',
                  desc: 'Fetch comments for post_1001',
                  auth: false,
                  action: () => runApiTest('GET', '/posts/post_1001/comments'),
                },
                {
                  method: 'GET',
                  endpoint: '/users/user_alex_101',
                  desc: 'Get public author profile information',
                  auth: false,
                  action: () => runApiTest('GET', '/users/user_alex_101'),
                },
                {
                  method: 'GET',
                  endpoint: '/users/user_alex_101/posts',
                  desc: 'Get all posts written by user_alex_101',
                  auth: false,
                  action: () => runApiTest('GET', '/users/user_alex_101/posts'),
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                          item.method === 'GET'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}
                      >
                        {item.method}
                      </span>
                      <code className="text-xs font-mono font-bold text-slate-800">
                        /api{item.endpoint}
                      </code>
                      {item.auth && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md font-semibold">
                          Requires JWT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>

                  <button
                    onClick={item.action}
                    disabled={testLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-semibold rounded-xl transition-all self-start sm:self-center shrink-0 active:scale-95"
                  >
                    <Play className="w-3 h-3" />
                    Test Endpoint
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Test Result Inspector */}
          {testedEndpoint && (
            <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Response Inspector:</span>
                  <span className="font-mono text-xs font-bold text-indigo-400">
                    {testedEndpoint}
                  </span>
                </div>
                {testStatus && (
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      testStatus >= 200 && testStatus < 300
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                        : 'bg-rose-900/60 text-rose-300 border border-rose-700'
                    }`}
                  >
                    Status: {testStatus}
                  </span>
                )}
              </div>

              {testLoading ? (
                <div className="py-8 text-center text-xs font-mono text-slate-400 animate-pulse">
                  Sending HTTP request to Express server...
                </div>
              ) : (
                <pre className="text-xs font-mono bg-slate-950 p-4 rounded-2xl overflow-x-auto text-emerald-400 max-h-80 leading-relaxed">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WINDOWS & VS CODE SETUP */}
      {activeTab === 'setup' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Laptop className="w-6 h-6 text-indigo-600" />
              Windows 11/10 & Visual Studio Code Step-by-Step Setup
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Follow this complete guide to clone, install, configure MongoDB, and run the JavaScript
              MERN application on Windows using VS Code terminal.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: 'Step 1: Install Node.js on Windows',
                desc: 'Download and install the Node.js LTS installer from nodejs.org (includes npm). Verify the installation in PowerShell:',
                cmd: 'node -v\nnpm -v',
              },
              {
                step: 'Step 2: Configure MongoDB (Local or MongoDB Atlas Cloud)',
                desc: 'Option A (Recommended): Free cloud MongoDB Atlas:\n1. Visit mongodb.com/cloud/atlas and create a free M0 cluster.\n2. In Database Access, create a user (e.g. devadmin).\n3. In Network Access, allow IP 0.0.0.0/0.\n4. Click Connect -> Drivers -> copy connection string.\n\nOption B (Local MongoDB on Windows):\nDownload MongoDB Community Server MSI and MongoDB Compass, install with "Run Service as Network Service". Default URI: mongodb://localhost:27017/blog_platform',
                cmd: '# Test local MongoDB service status in Windows PowerShell (Admin):\nGet-Service -Name MongoDB',
              },
              {
                step: 'Step 3: Open Project in VS Code',
                desc: 'Launch Visual Studio Code on Windows. Open the extracted project directory (File -> Open Folder...). Open the integrated terminal (Ctrl + `).',
                cmd: '# Verify current directory in PowerShell:\npwd\nls',
              },
              {
                step: 'Step 4: Install Dependencies',
                desc: 'Install all required backend and frontend dependencies declared in package.json:',
                cmd: 'npm install',
              },
              {
                step: 'Step 5: Setup Environment Variables (.env)',
                desc: 'Copy the sample environment configuration to a real .env file and set your credentials:',
                cmd: '# Windows PowerShell:\nCopy-Item .env.example .env\n\n# Or using CMD:\ncopy .env.example .env',
              },
              {
                step: 'Step 6: Configure .env Variables',
                desc: 'Open .env in VS Code and verify values:',
                cmd: 'PORT=3000\nNODE_ENV=development\nMONGODB_URI=mongodb://localhost:27017/blog_platform\nJWT_SECRET=super_secret_jwt_key_2026_change_in_production\nJWT_EXPIRE=7d',
              },
              {
                step: 'Step 7: Launch the Full-Stack Application (Pure JavaScript)',
                desc: 'Start the Express backend and Vite development server together on port 3000 using Node.js:',
                cmd: 'npm run dev',
              },
              {
                step: 'Step 8: Open in Browser',
                desc: 'Open Google Chrome or Microsoft Edge and navigate to http://localhost:3000. You will see the home page populated with sample articles and authentication ready!',
                cmd: '# You can also launch from PowerShell:\nStart-Process http://localhost:3000',
              },
            ].map((s, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{s.step}</h3>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    0{idx + 1}
                  </span>
                </div>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                  {s.desc}
                </p>
                <div className="relative group">
                  <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-xs font-mono overflow-x-auto">
                    {s.cmd}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(s.cmd, idx)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Copy command"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ARCHITECTURE & WORKING PROCESS */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-600" />
              MERN Stack Architecture & Lifecycle Flows
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Here is how React, Express, Node.js, and MongoDB communicate during end-to-end user
              interactions in pure JavaScript.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">User Registration Flow</h3>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed">
                <li>User enters full name, email, password on the Register page.</li>
                <li>Client-side validation verifies email format and minimum password length.</li>
                <li>Axios sends <code className="text-indigo-600">POST /api/auth/register</code>.</li>
                <li>Express router maps request to <code className="text-indigo-600">authController.register</code>.</li>
                <li>Controller checks MongoDB for duplicate email address.</li>
                <li>Password is hashed securely using bcrypt with 10 salt rounds.</li>
                <li>User document is persisted to MongoDB.</li>
                <li>Signed JWT token is generated and returned to client.</li>
                <li>Token is saved in localStorage and user is authenticated.</li>
              </ol>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <FileCode className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">Post Creation & Protection</h3>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed">
                <li>Author navigates to Create Post form.</li>
                <li>If not logged in, system prompts user to authenticate.</li>
                <li>User submits title, category, cover image, content, tags.</li>
                <li>Request attaches <code className="text-indigo-600">Authorization: Bearer &lt;token&gt;</code>.</li>
                <li><code className="text-indigo-600">authMiddleware.protect</code> verifies JWT signature.</li>
                <li>Middleware fetches user from DB and attaches <code className="text-indigo-600">req.user</code>.</li>
                <li>Post model saves document referencing <code className="text-indigo-600">author: req.user._id</code>.</li>
                <li>Newly created post immediately appears on Home and author's My Posts.</li>
              </ol>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-600">
                <Database className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">Cascading Deletion Lifecycle</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                When a post is deleted, orphaned comments must never remain in the database.
              </p>
              <div className="bg-slate-900 p-3 rounded-xl text-slate-200 text-xs font-mono">
                {`// Post controller deletion hook in JavaScript
await Post.findByIdAndDelete(postId);
await Comment.deleteMany({ post: postId });`}
              </div>
              <p className="text-xs text-slate-500">
                DevScribe executes atomic cascading deletion so all associated comments are cleaned
                up immediately upon post deletion.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <Server className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">Comment Moderation Security</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Two authorized parties can delete a comment:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
                <li><strong>The Comment Author:</strong> Can delete their own comment at any time.</li>
                <li><strong>The Post Author:</strong> Can remove inappropriate comments on their own article.</li>
                <li><strong>All Other Users:</strong> Denied with HTTP 403 Forbidden.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE & MONGOOSE MODELS */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-600" />
              Mongoose Database Schema Declarations (JavaScript)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Complete, copy-ready Mongoose model definitions in pure JavaScript for your MongoDB server.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              1. User Model (<code className="text-indigo-600">server/models/User.js</code>)
            </h3>
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed">
{`const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, index: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6 },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);`}
            </pre>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              2. Post Model (<code className="text-indigo-600">server/models/Post.js</code>)
            </h3>
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed">
{`const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 5 },
  content: { type: String, required: [true, 'Content is required'], minlength: 20 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true, index: true },
  coverImage: { type: String, default: '' },
  tags: [{ type: String }],
  readTime: { type: Number, default: 3 },
  likesCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

postSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);`}
            </pre>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              3. Comment Model (<code className="text-indigo-600">server/models/Comment.js</code>)
            </h3>
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed">
{`const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { type: String, required: [true, 'Comment content cannot be empty'], trim: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', commentSchema);`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 5: TESTING CHECKLIST */}
      {activeTab === 'testing' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              Full-Stack Verification & Testing Checklist
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Use this interactive checklist to verify every functional and security requirement in
              Section 9 of the specification.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {[
              {
                title: 'User Registration',
                desc: 'Register a new account via the Register page. Verify that a unique token is stored in localStorage and user is redirected.',
              },
              {
                title: 'Duplicate Email Registration',
                desc: 'Attempt to register with alex@example.com. Verify that server returns 400 with a clear error message.',
              },
              {
                title: 'Successful Login',
                desc: 'Log in with valid credentials. Verify user state is hydrated and avatar appears in navbar.',
              },
              {
                title: 'Invalid Login Credentials',
                desc: 'Enter an invalid password. Verify 401 response and error notification in UI.',
              },
              {
                title: 'Access to Protected Routes',
                desc: 'Try to visit Create Post or My Posts when logged out. Verify redirect/auth requirement is enforced.',
              },
              {
                title: 'Creating a Post',
                desc: 'Submit a new post with title, content, and category. Verify it is saved and visible on the Home feed.',
              },
              {
                title: 'Editing the Author\'s Own Post',
                desc: 'Open a post you authored. Click Edit, modify content, save, and verify updated date and text.',
              },
              {
                title: 'Attempting to Edit Another User\'s Post',
                desc: 'Log in as Sarah Chen and attempt to edit an article by Alex Rivera. Verify edit button is hidden and API returns 403 Forbidden.',
              },
              {
                title: 'Deleting a Post & Cascading Comments',
                desc: 'Delete an article with comments. Verify that all child comments are deleted and no orphaned records remain.',
              },
              {
                title: 'Adding a Comment',
                desc: 'Submit a comment on any article. Verify instant appearance in discussion and comment count increment.',
              },
              {
                title: 'Editing and Deleting Comments',
                desc: 'Comment author can edit content inline or delete comment. Post author can moderate inappropriate comments.',
              },
              {
                title: 'Searching and Filtering Posts',
                desc: 'Type keywords in the search bar and click category pills. Verify real-time filtered results.',
              },
              {
                title: 'Refreshing the Browser while Logged In',
                desc: 'Refresh page (F5). Verify JWT token in localStorage automatically re-hydrates user session via /api/auth/me.',
              },
              {
                title: 'Handling an Unavailable Database',
                desc: 'If MongoDB is offline or disconnected, system falls back gracefully to persistent local storage with zero crash.',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-4 sm:px-6 flex items-start gap-4">
                <input
                  type="checkbox"
                  id={`check-${idx}`}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer shrink-0"
                />
                <label htmlFor={`check-${idx}`} className="space-y-0.5 cursor-pointer">
                  <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
