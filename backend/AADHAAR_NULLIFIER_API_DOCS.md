# 🎯 Aadhaar Nullifier-Based Authentication System API Documentation

## 📋 Overview

This API provides a comprehensive authentication and posting system based on Aadhaar nullifier verification, with location-based post filtering, user activity tracking, and social interaction features.

### 🔑 Key Features

1. **Anonymous Aadhaar Verification**: Using nullifier hashes for privacy-preserving authentication
2. **Location-Based Filtering**: Users only see posts from their state
3. **User Activity Levels**: Progressive levels based on post count (new → active → super_active)
4. **Like/Dislike System**: Social interactions with automatic post deactivation
5. **JWT Authentication**: Secure token-based access control

---

## 🔐 Authentication Endpoints

### 1. Check Nullifier Availability
**POST** `/auth/check-nullifier`

Checks if an Aadhaar nullifier hash is valid and available for registration.

```json
{
  "nullifierHash": "0x1234567890abcdef"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nullifier is valid and available for registration"
}
```

### 2. User Registration
**POST** `/auth/register`

Register a new user with Aadhaar nullifier verification.

```json
{
  "nullifierHash": "0x1234567890abcdef",
  "username": "user_karnataka",
  "password": "password123",
  "walletAddress": "0xabcdef1234567890",
  "state": "Karnataka"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6888d287d77f44ad33ddbacd",
    "username": "user_karnataka",
    "walletAddress": "0xabcdef1234567890",
    "state": "karnataka",
    "userLevel": "new",
    "postsCount": 0
  }
}
```

### 3. User Login
**POST** `/auth/login`

Login with username and password to receive JWT token.

```json
{
  "username": "user_karnataka",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6888d287d77f44ad33ddbacd",
    "username": "user_karnataka",
    "walletAddress": "0xabcdef1234567890",
    "state": "karnataka",
    "userLevel": "active",
    "postsCount": 6,
    "lastLogin": "2025-07-29T13:48:08.052Z"
  }
}
```

---

## 📝 Post Management Endpoints

### 4. Create Post
**POST** `/api/posts`
**Headers:** `Authorization: Bearer <jwt_token>`

Create a new post. User's state is automatically attached for location filtering.

```json
{
  "caption": "Beautiful sunrise in Bangalore! Karnataka is amazing 🌅",
  "imageUrl": "QmKarnatakaPost123",
  "location": "Bangalore, Karnataka"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "postId": "POST-qa9a6lo52-1753797317330",
    "caption": "Beautiful sunrise in Bangalore! Karnataka is amazing 🌅",
    "hashtags": [],
    "walletAddress": "0xabcdef1234567890",
    "imageUrl": "QmKarnatakaPost123",
    "likeCount": 0,
    "dislikeCount": 0,
    "comment": [],
    "active": true,
    "author": "6888d287d77f44ad33ddbacd",
    "authorUsername": "user_karnataka",
    "authorState": "karnataka",
    "authorLevel": "new",
    "reportCount": 0,
    "createdAt": "2025-07-29T13:48:24.339Z",
    "lastInteraction": "2025-07-29T13:48:24.339Z"
  }
}
```

### 5. Get Posts (Location-Filtered)
**GET** `/api/posts`
**Headers:** `Authorization: Bearer <jwt_token>`

Retrieve posts filtered by user's state with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 20)

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "_id": "6888d2c5d77f44ad33ddbad6",
      "postId": "POST-qa9a6lo52-1753797317330",
      "caption": "Beautiful sunrise in Bangalore! Karnataka is amazing 🌅",
      "hashtags": [],
      "walletAddress": "0xabcdef1234567890",
      "imageUrl": "QmKarnatakaPost123",
      "likeCount": 1,
      "dislikeCount": 0,
      "comment": [],
      "active": true,
      "author": {
        "_id": "6888d287d77f44ad33ddbacd",
        "username": "user_karnataka",
        "state": "karnataka",
        "userLevel": "active"
      },
      "authorUsername": "user_karnataka",
      "authorState": "karnataka",
      "authorLevel": "active",
      "reportCount": 0,
      "createdAt": "2025-07-29T13:55:17.370Z",
      "lastInteraction": "2025-07-29T13:55:17.370Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalPosts": 6,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 6. Get All Posts (Admin)
**GET** `/api/posts/all`

Retrieve all posts without location filtering (for admin/testing purposes).

### 7. Get My Posts
**GET** `/api/posts/my-posts`
**Headers:** `Authorization: Bearer <jwt_token>`

Retrieve posts created by the authenticated user.

---

## 👍 Social Interaction Endpoints

### 8. Like Post
**POST** `/api/posts/:postId/like`
**Headers:** `Authorization: Bearer <jwt_token>`

Like a post. Users can only like a post once.

**Response:**
```json
{
  "success": true,
  "message": "Post liked successfully",
  "post": {
    "postId": "POST-qa9a6lo52-1753797317330",
    "likeCount": 1,
    "dislikeCount": 0
  }
}
```

**Error Response (if already liked):**
```json
{
  "success": false,
  "message": "You have already liked this post"
}
```

### 9. Dislike Post
**POST** `/api/posts/:postId/dislike`
**Headers:** `Authorization: Bearer <jwt_token>`

Dislike a post. Users can only dislike a post once. Post automatically deactivates after 10 dislikes.

**Response:**
```json
{
  "success": true,
  "message": "Post disliked successfully",
  "post": {
    "postId": "POST-8xlqhczed-1753797327800",
    "likeCount": 0,
    "dislikeCount": 1,
    "active": true
  }
}
```

**Response (if post reaches 10 dislikes):**
```json
{
  "success": true,
  "message": "Post disliked successfully. Post has been deactivated due to excessive dislikes.",
  "post": {
    "postId": "POST-example",
    "likeCount": 0,
    "dislikeCount": 10,
    "active": false
  }
}
```

---

## 👤 User System Features

### User Activity Levels

Users progress through activity levels based on their post count:

1. **new**: 0-4 posts
2. **active**: 5-9 posts  
3. **super_active**: 10+ posts

User levels are automatically updated when creating posts and reflected in all post responses.

### Location-Based Filtering

- Posts are automatically filtered by the user's state
- Users only see posts from other users in the same state
- Cross-state interactions (likes/dislikes) are still possible
- State names are stored in lowercase for consistent filtering

### Interaction Tracking

- Each user can only like OR dislike a post once
- Previous interactions are tracked in the `PostInteraction` collection
- Attempting duplicate interactions returns appropriate error messages
- Like/dislike counts are automatically updated

### Automatic Post Deactivation

- Posts with 10 or more dislikes are automatically deactivated
- Deactivated posts have `active: false` and don't appear in regular queries
- The deactivation process includes user activity level updates

---

## 🔒 Authentication & Security

### JWT Tokens

- Tokens expire in 7 days (configurable)
- Include user ID for authorization
- Required for all protected endpoints

### Nullifier Hash Security

- Each Aadhaar nullifier hash can only be used once
- Provides privacy-preserving identity verification
- Prevents duplicate registrations

### Password Security

- Passwords are hashed using bcryptjs with salt rounds: 12
- Minimum length: 6 characters
- Secure comparison during login

---

## 🧪 Testing Examples

### Complete Workflow Test

1. **Check nullifier**: POST `/auth/check-nullifier`
2. **Register user**: POST `/auth/register`
3. **Login**: POST `/auth/login`
4. **Create posts**: POST `/api/posts` (repeat to upgrade user level)
5. **View posts**: GET `/api/posts` (filtered by state)
6. **Like/dislike**: POST `/api/posts/:postId/like` or `/api/posts/:postId/dislike`

### Cross-State Testing

1. Register users from different states
2. Create posts from each user
3. Verify location filtering works correctly
4. Test cross-state interactions if allowed

### Deactivation Testing

1. Create a test post
2. Generate 10 dislikes from different users
3. Verify post becomes inactive

---

## 📊 Database Schema

### AuthUser Collection
```javascript
{
  nullifierHash: String (unique, indexed),
  username: String (unique, indexed),
  password: String (hashed),
  walletAddress: String (unique),
  state: String (indexed, lowercase),
  postsCount: Number (default: 0),
  userLevel: String (enum: ['new', 'active', 'super_active']),
  isActive: Boolean (default: true),
  createdAt: Date,
  lastLogin: Date
}
```

### Post Collection
```javascript
{
  postId: String (unique),
  caption: String,
  hashtags: [String],
  walletAddress: String,
  imageUrl: String,
  likeCount: Number (default: 0),
  dislikeCount: Number (default: 0),
  comment: [Object],
  active: Boolean (default: true),
  author: ObjectId (ref: AuthUser),
  authorUsername: String,
  authorState: String (indexed),
  authorLevel: String,
  reportCount: Number (default: 0),
  createdAt: Date,
  lastInteraction: Date
}
```

### PostInteraction Collection
```javascript
{
  userId: ObjectId (ref: AuthUser),
  postId: String,
  interactionType: String (enum: ['like', 'dislike']),
  createdAt: Date
}
// Compound unique index: {userId: 1, postId: 1}
```

---

## 🚀 Deployment Notes

### Environment Variables Required

```env
MONGO_URI=mongodb+srv://...
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-session-secret-key
```

### Port Configuration

- Default port: 3001 (changed from 5000 to avoid macOS AirPlay conflicts)
- Configurable via PORT environment variable

### Database Indexes

The system automatically creates indexes for:
- `nullifierHash` (unique)
- `username` (unique) 
- `authorState` (for location filtering)
- `userId + postId` (for interaction tracking)

---

## ✅ Testing Status

| Feature | Status | Notes |
|---------|--------|-------|
| Nullifier Registration | ✅ Working | Unique constraint enforced |
| Username/Password Login | ✅ Working | JWT generation successful |
| Post Creation | ✅ Working | Auto-state assignment |
| Location Filtering | ✅ Working | State-based filtering active |
| Like/Dislike System | ✅ Working | Duplicate prevention working |
| User Level Upgrade | ✅ Working | Auto-upgrade at 5+ posts |
| Automatic Deactivation | ⚠️ Partially Tested | Logic implemented, needs 10 users for full test |
| Cross-State Interaction | ✅ Working | Currently allowed |

---

This documentation covers the complete Aadhaar nullifier-based authentication system with location filtering, user activity tracking, and social interaction features. The system is ready for production use with appropriate security measures and scalable architecture.
