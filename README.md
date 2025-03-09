# Notion Clone API

A RESTful API for managing tasks and users, built with Node.js and Express.

## Installation

1. Install dependencies:

```bash
npm install
```

1. Set up the database:
   - Install MariaDB if you haven't already
   - Copy `.env.example` to `.env` and update the database connection settings

## Database Setup

1. Create the database and tables using the SQL script:

```bash
mysql -u root -p < database.sql
```

1. Fill in the **`.env`** file with your database connection details:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_DATABASE=notion_clone
JWT_SECRET=your_jwt_secret
```

1. Start the server:

```bash
npm start
```

The server will run on port 5001 by default. You can change this by setting the PORT environment variable in your .env file.

## API Documentation

The API documentation is available at the root URL when the server is running:

- API Documentation: <http://localhost:5001/>
