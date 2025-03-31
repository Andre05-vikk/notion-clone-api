# Notion Clone API

A RESTful API for managing tasks and users, built with Node.js, Express, and MariaDB.

## Features

- User authentication with JWT
- Task management (create, read, update, delete)
- Swagger UI for API documentation and testing

## Prerequisites

- Node.js (v14 or higher)
- MariaDB (v10 or higher)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up the environment variables:

```bash
# Create a .env file with your database connection details
npm run create-env
```

Or manually create a `.env` file with the following content:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=notion_clone
JWT_SECRET=your-secret-key
```

3. Set up the database:

```bash
# Create the database and tables
mysql -u root -p < database.sql
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will run on port 5001 by default. You can change this by setting the PORT environment variable in your .env file.

## API Documentation

The API documentation is available in multiple languages when the server is running:

- English Documentation: `<your-server-url>/en`
- Estonian Documentation: `<your-server-url>/et`
- Default (redirects to English): `<your-server-url>/`

For local development:

- English Documentation: <http://localhost:5001/en>
- Estonian Documentation: <http://localhost:5001/et>
- Default: <http://localhost:5001/>

You can use the Swagger UI to test all endpoints directly from your browser.

## Database Structure

The application uses two main tables:

- `users`: Stores user information
- `tasks`: Stores task information with a foreign key to the users table
