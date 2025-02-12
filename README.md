# Notion Clone API

A RESTful API for managing tasks and users, built with Node.js and Express.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
- Install MariaDB if you haven't already
- Create a new MariaDB database named 'notion_clone'
- Copy `.env.example` to `.env` and update the database connection settings:
```env
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_DATABASE=notion_clone
```

3. Run database migrations:
```bash
npm run migrate
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Documentation

The API documentation is available through SwaggerUI at the root endpoint. After starting the server, visit:

```
http://localhost:3000
```
- `403`: Invalid token

#### Update a Task (Partial)
Update specific fields of a task:
```http
PATCH /tasks/{taskId}
Authorization: Bearer your-jwt-token

{
    "title": "Updated task title",      // optional
    "description": "New description", // optional
    "status": "in_progress",         // optional: todo, in_progress, done
    "due_date": "2024-12-31T23:59:59Z" // optional
}
```

Responses:
- `200`: Task successfully updated (returns updated task)
- `400`: No fields to update provided
- `404`: Task not found or unauthorized
- `401`: Authentication required
- `403`: Invalid token


The API documentation is available through Swagger UI at:
```
http://localhost:5001/api-docs
```

## Authentication

2. Include the token in your requests using the Authorization header:
```
Authorization: Bearer <your-token>
```

### Available Endpoints

- Root API: `http://localhost:5001/`
- Tasks API: `http://localhost:5001/tasks`


## Project Structure

- `server.js` - Main application entry point
- `openapi.yaml` - API specification and documentation
- `package.json` - Project dependencies and scripts