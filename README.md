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
   - Copy `.env.example` to `.env` and update the database connection settings

3. Start the server:
```bash
npm start
```

## API Documentation

The API documentation is available through Swagger UI at the root endpoint. After starting the server, visit:

```
http://localhost:5001
```

## Available Endpoints

Root API: http://localhost:5001/
Tasks API: http://localhost:5001/tasks