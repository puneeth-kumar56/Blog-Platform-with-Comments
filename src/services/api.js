import axios from 'axios';

const API_BASE_URL = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if available in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devscribe_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract clean error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    return Promise.reject(new Error(message));
  }
);

// --- Auth API ---
export const authApi = {
  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
};

// --- Posts API ---
export const postsApi = {
  getPosts: async (params) => {
    const res = await apiClient.get('/posts', { params });
    return res.data;
  },

  getPostById: async (id) => {
    const res = await apiClient.get(`/posts/${id}`);
    return res.data;
  },

  createPost: async (postData) => {
    const res = await apiClient.post('/posts', postData);
    return res.data;
  },

  updatePost: async (id, postData) => {
    const res = await apiClient.put(`/posts/${id}`, postData);
    return res.data;
  },

  deletePost: async (id) => {
    const res = await apiClient.delete(`/posts/${id}`);
    return res.data;
  },

  getMyPosts: async () => {
    const res = await apiClient.get('/posts/my-posts');
    return res.data;
  },
};

// --- Comments API ---
export const commentsApi = {
  getComments: async (postId) => {
    const res = await apiClient.get(`/posts/${postId}/comments`);
    return res.data;
  },

  addComment: async (postId, content) => {
    const res = await apiClient.post(`/posts/${postId}/comments`, { content });
    return res.data;
  },

  updateComment: async (commentId, content) => {
    const res = await apiClient.put(`/comments/${commentId}`, { content });
    return res.data;
  },

  deleteComment: async (commentId) => {
    const res = await apiClient.delete(`/comments/${commentId}`);
    return res.data;
  },
};

// --- Users API ---
export const usersApi = {
  getUserProfile: async (id) => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  },

  getUserPosts: async (id) => {
    const res = await apiClient.get(`/users/${id}/posts`);
    return res.data;
  },
};

// --- Health API ---
export const systemApi = {
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },
};
