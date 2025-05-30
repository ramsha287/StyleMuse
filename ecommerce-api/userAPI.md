# User Management API Documentation

## Base URL
```
http://localhost:5000/api/auth
```

> **Note:** The API does not use versioning in the URL (no `/v1/`). All endpoints are accessed directly under `/api/auth/`.

## Available Endpoints

### 1. Register User
Create a new user account.

**Endpoint:** `POST /register`

**Full URL:** `http://localhost:5000/api/auth/register`

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
}
```

**Validation Rules:**
- Name: Required, 2-50 characters
- Email: Required, valid email format
- Password: Required, minimum 6 characters, must contain:
  - At least one number
  - At least one lowercase letter
  - At least one uppercase letter

**Response (201 Created):**
```json
{
    "success": true,
    "token": "jwt_token_here",
    "user": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
    }
}
```

**Error Response (400 Bad Request):**
```json
{
    "success": false,
    "errors": [
        {
            "msg": "Name is required",
            "param": "name",
            "location": "body"
        }
        // ... other validation errors
    ]
}
```

### 2. Login User
Authenticate user and get access token.

**Endpoint:** `POST /login`

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "Password123"
}
```

**Validation Rules:**
- Email: Required, valid email format
- Password: Required

**Response (200 OK):**
```json
{
    "success": true,
    "token": "jwt_token_here",
    "user": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
    }
}
```

**Error Response (400 Bad Request):**
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

### 3. Get Current User
Get the authenticated user's profile.

**Endpoint:** `GET /me`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "user": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "createdAt": "2024-03-29T12:00:00.000Z"
    }
}
```

**Error Response (401 Unauthorized):**
```json
{
    "success": false,
    "message": "Not authorized to access this route"
}
```

### 4. Update User Profile
Update the authenticated user's profile information.

**Endpoint:** `PATCH /profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
    "name": "John Smith",
    "email": "john.smith@example.com"
}
```

**Validation Rules:**
- Name: Optional, 2-50 characters
- Email: Optional, valid email format

**Response (200 OK):**
```json
{
    "success": true,
    "user": {
        "id": "user_id",
        "name": "John Smith",
        "email": "john.smith@example.com",
        "role": "user"
    }
}
```

**Error Response (404 Not Found):**
```json
{
    "success": false,
    "message": "User not found"
}
```

### 5. Change Password
Change the authenticated user's password.

**Endpoint:** `PUT /change-password`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
    "currentPassword": "OldPassword123",
    "newPassword": "NewPassword123"
}
```

**Validation Rules:**
- Current Password: Required
- New Password: Required, minimum 6 characters, must contain:
  - At least one number
  - At least one lowercase letter
  - At least one uppercase letter

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Password updated successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
    "success": false,
    "message": "Current password is incorrect"
}
```

### 6. Forgot Password
Request a password reset link.

**Endpoint:** `POST /forgot-password`

**Request Body:**
```json
{
    "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Password reset link sent to email"
}
```

### 7. Reset Password
Reset password using the token from email.

**Endpoint:** `POST /reset-password`

**Request Body:**
```json
{
    "token": "reset_token_from_email",
    "password": "NewPassword123"
}
```

**Validation Rules:**
- Token: Required
- Password: Required, minimum 6 characters, must contain:
  - At least one number
  - At least one lowercase letter
  - At least one uppercase letter

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Password reset successfully"
}
```

## Admin Only Endpoints

### 8. Get All Users
Get a list of all users (admin only).

**Endpoint:** `GET /users`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name or email
- `role`: Filter by role
- `status`: Filter by status (active/inactive)

**Response (200 OK):**
```json
{
    "success": true,
    "count": 100,
    "pagination": {
        "page": 1,
        "limit": 10,
        "pages": 10
    },
    "users": [
        {
            "id": "user_id",
            "name": "John Doe",
            "email": "john@example.com",
            "role": "user",
            "status": "active",
            "createdAt": "2024-03-29T12:00:00.000Z"
        }
    ]
}
```

### 9. Get User by ID
Get details of a specific user (admin only).

**Endpoint:** `GET /users/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "user": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "status": "active",
        "createdAt": "2024-03-29T12:00:00.000Z"
    }
}
```

### 10. Update User Role
Update a user's role (admin only).

**Endpoint:** `PUT /users/:id/role`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
    "role": "admin"
}
```

**Validation Rules:**
- Role: Required, must be one of: "user", "admin"

**Response (200 OK):**
```json
{
    "success": true,
    "user": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin"
    }
}
```

### 11. Delete User
Delete a user account (admin only).

**Endpoint:** `DELETE /users/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "User deleted successfully"
}
```

### 12. Deactivate User
Deactivate a user account (admin only).

**Endpoint:** `PUT /users/:id/deactivate`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "User deactivated successfully"
}
```

### 13. Reactivate User
Reactivate a deactivated user account (admin only).

**Endpoint:** `PUT /users/:id/reactivate`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "User reactivated successfully"
}
```



## Error Responses

### 400 Bad Request
```json
{
    "success": false,
    "message": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
    "success": false,
    "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
    "success": false,
    "message": "Access forbidden"
}
```

### 404 Not Found
```json
{
    "success": false,
    "message": "Resource not found"
}
```

### 500 Server Error
```json
{
    "success": false,
    "message": "Server error"
}
```

## Notes

1. All protected routes require a valid JWT token in the Authorization header
2. Token format: `Bearer <jwt_token>`
3. Tokens expire after 24 hours
4. Rate limiting is applied to authentication endpoints:
   - 5 login attempts per hour per IP
   - 100 requests per 15 minutes for other endpoints
5. Admin routes require the user to have the "admin" role
6. User status can be either "active" or "inactive"
7. Deactivated users cannot log in until reactivated by an admin

## Security Considerations

1. Passwords are hashed using bcrypt before storage
2. JWT tokens are signed with a secret key from environment variables
3. Email addresses are normalized before storage
4. All sensitive routes are protected with authentication middleware
5. Input validation is performed on all requests
6. Rate limiting is implemented to prevent brute force attacks
7. Admin actions are logged for audit purposes 