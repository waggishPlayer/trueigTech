# FitPlanHub API Design

Base URL: `http://localhost:5000`

All authenticated requests require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication

### POST /auth/signup

Register a new user or trainer account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "USER"  // or "TRAINER"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

---

### POST /auth/login

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

---

## Fitness Plans

### POST /plans

Create a new fitness plan (Trainer only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "30-Day Full Body Workout",
  "description": "Complete full body transformation program",
  "price": 49.99,
  "durationDays": 30
}
```

**Response (201):**
```json
{
  "message": "Plan created successfully",
  "plan": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "30-Day Full Body Workout",
    "description": "Complete full body transformation program",
    "price": 49.99,
    "durationDays": 30,
    "trainerId": "507f191e810c19729de860ea",
    "createdAt": "2024-12-14T13:07:32.000Z",
    "updatedAt": "2024-12-14T13:07:32.000Z"
  }
}
```

---

### PUT /plans/:planId

Update an existing plan (Only owner trainer).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Plan Title",
  "price": 59.99
}
```

**Response (200):**
```json
{
  "message": "Plan updated successfully",
  "plan": { /* updated plan object */ }
}
```

---

### DELETE /plans/:planId

Delete a plan (Only owner trainer).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Plan deleted successfully"
}
```

---

### GET /plans

Get all plans (preview mode, no authentication required).

**Response (200):**
```json
{
  "plans": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "30-Day Full Body Workout",
      "price": 49.99,
      "trainerName": "Jane Smith",
      "durationDays": 30,
      "createdAt": "2024-12-14T13:07:32.000Z"
    }
  ]
}
```

---

### GET /plans/:planId

Get plan details (full details if subscribed, preview otherwise).

**Headers:** `Authorization: Bearer <token>`

**Response - Subscribed (200):**
```json
{
  "plan": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "30-Day Full Body Workout",
    "description": "Complete full body transformation program...",
    "price": 49.99,
    "durationDays": 30,
    "trainerId": {
      "_id": "507f191e810c19729de860ea",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "createdAt": "2024-12-14T13:07:32.000Z",
    "updatedAt": "2024-12-14T13:07:32.000Z"
  }
}
```

**Response - Not Subscribed (200):**
```json
{
  "plan": {
    "id": "507f1f77bcf86cd799439011",
    "title": "30-Day Full Body Workout",
    "price": 49.99,
    "trainerName": "Jane Smith",
    "durationDays": 30,
    "message": "Subscribe to view full details"
  }
}
```

---

### POST /plans/:planId/subscribe

Subscribe to a plan (User only).

**Headers:** `Authorization: Bearer <token>`

**Response (201):**
```json
{
  "message": "Subscription successful",
  "subscription": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "planId": "507f1f77bcf86cd799439011",
    "subscribedAt": "2024-12-14T13:07:32.000Z"
  }
}
```

---

## Trainers

### GET /trainers

Get all trainers.

**Response (200):**
```json
{
  "trainers": [
    {
      "_id": "507f191e810c19729de860ea",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "TRAINER",
      "createdAt": "2024-12-14T13:07:32.000Z"
    }
  ]
}
```

---

### GET /trainers/:trainerId

Get specific trainer details.

**Response (200):**
```json
{
  "trainer": {
    "_id": "507f191e810c19729de860ea",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "TRAINER",
    "createdAt": "2024-12-14T13:07:32.000Z"
  }
}
```

---

### POST /trainers/:trainerId/follow

Follow a trainer (User only).

**Headers:** `Authorization: Bearer <token>`

**Response (201):**
```json
{
  "message": "Successfully followed trainer",
  "follow": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "trainerId": "507f1f77bcf86cd799439012",
    "followedAt": "2024-12-14T13:07:32.000Z"
  }
}
```

---

### DELETE /trainers/:trainerId/unfollow

Unfollow a trainer (User only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Successfully unfollowed trainer"
}
```

---

## Feed

### GET /feed

Get personalized feed of plans from followed trainers (User only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "feed": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "30-Day Full Body Workout",
      "description": "Complete full body transformation program...",
      "price": 49.99,
      "durationDays": 30,
      "trainer": {
        "id": "507f191e810c19729de860ea",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "isPurchased": true,
      "createdAt": "2024-12-14T13:07:32.000Z"
    }
  ]
}
```

---

## Error Responses

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid token"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Server Error:**
```json
{
  "error": "Server error"
}
```

---

## Access Control Summary

| Endpoint | USER | TRAINER | Public |
|----------|------|---------|--------|
| POST /auth/signup | ✓ | ✓ | ✓ |
| POST /auth/login | ✓ | ✓ | ✓ |
| POST /plans | ✗ | ✓ | ✗ |
| PUT /plans/:planId | ✗ | ✓ (own) | ✗ |
| DELETE /plans/:planId | ✗ | ✓ (own) | ✗ |
| GET /plans | ✓ | ✓ | ✓ |
| GET /plans/:planId | ✓ | ✓ | ✗ |
| POST /plans/:planId/subscribe | ✓ | ✗ | ✗ |
| GET /trainers | ✓ | ✓ | ✓ |
| GET /trainers/:trainerId | ✓ | ✓ | ✓ |
| POST /trainers/:trainerId/follow | ✓ | ✗ | ✗ |
| DELETE /trainers/:trainerId/unfollow | ✓ | ✗ | ✗ |
| GET /feed | ✓ | ✗ | ✗ |
