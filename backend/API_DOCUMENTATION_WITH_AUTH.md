# 🔐 **Complete API Documentation with Google OAuth & JWT Authentication**

## **Base URL:** `http://localhost:3001`

---

## 🚀 **Authentication System Overview**

Your backend now supports:
- **Google OAuth 2.0** signup/login
- **Local registration/login** with email & password
- **JWT token-based** authentication
- **Protected routes** for creating/managing posts
- **Backward compatibility** with existing endpoints

---

## 🔑 **1. Authentication Endpoints**

### **POST** `/auth/register` (Local Registration)
- **Method:** POST
- **URL:** `http://localhost:3001/auth/register`
- **Headers:**
```json
{
  "Content-Type": "application/json"
}
```
- **Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```
- **Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "provider": "local"
  }
}
```

### **POST** `/auth/login` (Local Login)
- **Method:** POST
- **URL:** `http://localhost:3001/auth/login`
- **Headers:**
```json
{
  "Content-Type": "application/json"
}
```
- **Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### **GET** `/auth/google` (Google OAuth - Start)
- **Method:** GET
- **URL:** `http://localhost:3001/auth/google`
- **Description:** Redirects to Google OAuth consent screen
- **Usage:** Open this URL in browser to start Google login

### **GET** `/auth/google/callback` (Google OAuth - Callback)
- **Method:** GET
- **URL:** `http://localhost:3001/auth/google/callback`
- **Description:** Google redirects here after user consent
- **Returns:** JWT token and user info

### **GET** `/auth/me` (Get Current User - Protected)
- **Method:** GET
- **URL:** `http://localhost:3001/auth/me`
- **Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

### **PUT** `/auth/profile` (Update Profile - Protected)
- **Method:** PUT
- **URL:** `http://localhost:3001/auth/profile`
- **Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```
- **Body (JSON):**
```json
{
  "name": "Updated Name",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

### **POST** `/auth/logout` (Logout - Protected)
- **Method:** POST
- **URL:** `http://localhost:3001/auth/logout`
- **Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

---

## 📝 **2. Post Management (Updated with Authentication)**

### **POST** `/api/posts` (Create Post - Protected)
- **Method:** POST
- **URL:** `http://localhost:3001/api/posts`
- **Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```
- **Body (JSON):**
```json
{
  "caption": "My amazing authenticated post! 🚀",
  "hashtags": ["#authenticated", "#jwt", "#ghostpic"],
  "imageUrl": "https://ipfs.io/ipfs/QmYourImageHashHere",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

### **GET** `/api/posts` (Get All Posts - Public)
- **Method:** GET
- **URL:** `http://localhost:3001/api/posts`
- **Headers:** None required

### **GET** `/api/posts/my-posts` (Get My Posts - Protected)
- **Method:** GET
- **URL:** `http://localhost:3001/api/posts/my-posts`
- **Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

### **GET** `/api/posts/:postId` (Get Specific Post - Public)
- **Method:** GET
- **URL:** `http://localhost:3001/api/posts/POST-abc123-1234567890`

### **PUT** `/api/posts/:postId` (Update Post - Protected)
- **Method:** PUT
- **URL:** `http://localhost:3001/api/posts/POST-abc123-1234567890`
- **Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```
- **Body (JSON):**
```json
{
  "caption": "Updated caption",
  "hashtags": ["#updated", "#post"]
}
```

### **DELETE** `/api/posts/:postId` (Delete Post - Protected)
- **Method:** DELETE
- **URL:** `http://localhost:3001/api/posts/POST-abc123-1234567890`
- **Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

---

## 🔄 **3. Legacy Endpoints (Backward Compatibility)**

### **POST** `/api/savePost` (Legacy Create Post)
- **Method:** POST
- **URL:** `http://localhost:3001/api/savePost`
- **Headers:**
```json
{
  "Content-Type": "application/json"
}
```
- **Body (JSON):**
```json
{
  "caption": "Legacy post without authentication",
  "hashtags": ["#legacy"],
  "walletAddress": "0x9876543210fedcba9876543210fedcba98765432",
  "imageUrl": "https://ipfs.io/ipfs/QmLegacyImageHash"
}
```

### **POST** `/api/save-user` (Legacy Save User)
- **Method:** POST
- **URL:** `http://localhost:3001/api/save-user`
- **Headers:**
```json
{
  "Content-Type": "application/json"
}
```
- **Body (JSON):**
```json
{
  "walletAddress": "0x9876543210fedcba9876543210fedcba98765432",
  "userId": "legacyUser456",
  "txHash": "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321"
}
```

### **GET** `/api/get-user` (Legacy Get User)
- **Method:** GET
- **URL:** `http://localhost:3001/api/get-user?walletAddress=0x9876543210fedcba9876543210fedcba98765432`

---

## 🧪 **4. Testing Workflow**

### **Step 1: Register/Login**
1. **Register**: `POST /auth/register` or **Google Login**: Visit `GET /auth/google`
2. **Copy the JWT token** from the response
3. **Set Authorization header** for all protected routes: `Bearer YOUR_JWT_TOKEN`

### **Step 2: Test Protected Routes**
1. **Get Profile**: `GET /auth/me`
2. **Create Post**: `POST /api/posts`
3. **Get My Posts**: `GET /api/posts/my-posts`
4. **Update/Delete Posts**: `PUT/DELETE /api/posts/:postId`

### **Step 3: Test Public Routes**
1. **Get All Posts**: `GET /api/posts`
2. **Get Specific Post**: `GET /api/posts/:postId`

---

## 🔒 **5. Authentication Flow Examples**

### **Complete Registration & Post Creation Flow:**

```bash
# 1. Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# 2. Extract token from response, then create post
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "caption": "My first authenticated post!",
    "hashtags": ["#first", "#authenticated"],
    "imageUrl": "https://example.com/image.jpg"
  }'

# 3. Get my posts
curl -X GET http://localhost:3001/api/posts/my-posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## ⚡ **6. Key Features**

✅ **Google OAuth Integration**
✅ **JWT Authentication**  
✅ **Protected Routes**
✅ **User Profile Management**
✅ **Post Ownership & Management**
✅ **Backward Compatibility**
✅ **Error Handling**
✅ **User Context in Posts**

---

## 🚨 **Important Notes:**

1. **JWT Tokens**: Store securely and include in `Authorization: Bearer TOKEN` header
2. **Google OAuth**: Requires Google Client ID/Secret configuration
3. **Protected Routes**: Require valid JWT token
4. **Legacy Routes**: Still work without authentication
5. **Post Ownership**: Users can only edit/delete their own posts
