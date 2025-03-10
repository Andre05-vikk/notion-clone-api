# Notion Clone API Documentation

This document provides comprehensive documentation for the Notion Clone API, a RESTful API for managing tasks and users, built with Node.js and Express.

## Base URL

All endpoints are relative to the base URL: `/`

## Authentication

Most endpoints require authentication using a JWT token. To authenticate, include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

You can obtain a JWT token by logging in through the `/sessions` endpoint.

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests. In case of an error, the response body will contain details about what went wrong.

Example error response:

```json
{
  "code": 400,
  "error": "Bad Request",
  "message": "Invalid input data"
}
```

## Endpoints

### Authentication

#### Login

```
POST /sessions
```

Authenticate a user and receive a JWT token.

**Request Body:**

```json
{
  "username": "email@domain.com",
  "password": "mypassword"
}
```

**Responses:**

- `200 OK`: Successful login
  ```json
  {
    "token": "jwt.token.example"
  }
  ```
- `401 Unauthorized`: Invalid credentials

#### Logout

```
DELETE /sessions
```

Delete the current user's session.

**Authentication Required**: Yes

**Responses:**

- `204 No Content`: Session successfully deleted
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

### Users

#### Create User

```
POST /users
```

Register a new user account.

**Request Body:**

```json
{
  "username": "email@domain.com",
  "password": "mypassword"
}
```

**Responses:**

- `201 Created`: User created successfully
  ```json
  {
    "id": 1,
    "username": "email@domain.com",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
  }
  ```
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Username already exists

#### List All Users

```
GET /users
```

Get a list of all users.

**Authentication Required**: Yes

**Responses:**

- `200 OK`: List of users
  ```json
  [
    {
      "id": 1,
      "username": "email@domain.com",
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z"
    },
    {
      "id": 2,
      "username": "another@domain.com",
      "createdAt": "2023-01-02T12:00:00Z",
      "updatedAt": "2023-01-02T12:00:00Z"
    }
  ]
  ```
- `401 Unauthorized`: Authentication required

#### Get User by ID

```
GET /users/{userId}
```

Get detailed information about a specific user.

**Parameters:**

- `userId` (path, required): ID of the user

**Authentication Required**: Yes

**Responses:**

- `200 OK`: User details
  ```json
  {
    "id": 1,
    "username": "email@domain.com",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
  }
  ```
- `401 Unauthorized`: Authentication required
- `404 Not Found`: User not found

#### Update User

```
PATCH /users/{userId}
```

Update user information (currently only password).

**Parameters:**

- `userId` (path, required): ID of the user

**Request Body:**

```json
{
  "password": "newstrongpassword"
}
```

**Authentication Required**: Yes

**Responses:**

- `200 OK`: User updated successfully
  ```json
  {
    "id": 1,
    "username": "email@domain.com",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T13:00:00Z"
  }
  ```
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required
- `404 Not Found`: User not found

#### Delete User

```
DELETE /users/{userId}
```

Delete user's account and all associated tasks.

**Parameters:**

- `userId` (path, required): ID of the user

**Authentication Required**: Yes

**Responses:**

- `204 No Content`: User deleted successfully
  ```json
  {
    "message": "User deleted successfully"
  }
  ```
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

### Tasks

#### List All Tasks

```
GET /tasks
```

Get a list of all tasks with pagination, sorting, and filtering options.

**Parameters:**

- `page` (query, optional): Page number for pagination (starts from 1, default: 1)
- `limit` (query, optional): Number of items per page (default: 10)
- `sort` (query, optional): Sort field and direction (e.g., title:asc, createdAt:desc)
- `status` (query, optional): Filter tasks by status (pending, in_progress, completed)

**Authentication Required**: Yes

**Responses:**

- `200 OK`: List of tasks
  ```json
  {
    "page": 1,
    "limit": 10,
    "total": 25,
    "tasks": [
      {
        "id": 1,
        "title": "Task title",
        "description": "Task description",
        "status": "pending",
        "user_id": 1,
        "createdAt": "2023-01-01T12:00:00Z",
        "updatedAt": "2023-01-01T12:00:00Z"
      },
      {
        "id": 2,
        "title": "Another task",
        "description": null,
        "status": "in_progress",
        "user_id": 1,
        "createdAt": "2023-01-02T12:00:00Z",
        "updatedAt": "2023-01-02T12:00:00Z"
      }
    ]
  }
  ```
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

#### Create Task

```
POST /tasks
```

Create a new task.

**Request Body:**

```json
{
  "title": "New task title",
  "description": "Detailed task description",
  "status": "pending"
}
```

**Authentication Required**: Yes

**Responses:**

- `201 Created`: Task created successfully
  ```json
  {
    "id": 3,
    "title": "New task title",
    "description": "Detailed task description",
    "status": "pending",
    "user_id": 1,
    "createdAt": "2023-01-03T12:00:00Z",
    "updatedAt": "2023-01-03T12:00:00Z"
  }
  ```
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

#### Update Task

```
PATCH /tasks/{taskId}
```

Update an existing task's fields.

**Parameters:**

- `taskId` (path, required): ID of the task to modify

**Request Body:**

```json
{
  "title": "Updated task title",
  "description": "Updated task description",
  "status": "in_progress"
}
```

**Authentication Required**: Yes

**Responses:**

- `200 OK`: Task updated successfully
  ```json
  {
    "id": 3,
    "title": "Updated task title",
    "description": "Updated task description",
    "status": "in_progress",
    "user_id": 1,
    "createdAt": "2023-01-03T12:00:00Z",
    "updatedAt": "2023-01-03T13:00:00Z"
  }
  ```
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Server error

#### Delete Task

```
DELETE /tasks/{taskId}
```

Delete a specific task by ID.

**Parameters:**

- `taskId` (path, required): ID of the task to delete

**Authentication Required**: Yes

**Responses:**

- `204 No Content`: Task successfully deleted
  ```json
  {
    "message": "Task deleted successfully"
  }
  ```
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Server error

## Data Models

### User

```json
{
  "id": 1,
  "username": "email@domain.com",
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-01T12:00:00Z"
}
```

### Task

```json
{
  "id": 1,
  "title": "Task title",
  "description": "Task description",
  "status": "pending",
  "user_id": 1,
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-01T12:00:00Z"
}
```

### Task Status

Tasks can have one of the following statuses:

- `pending`: Task is waiting to be started
- `in_progress`: Task is currently being worked on
- `completed`: Task has been completed