# Notion Clone

A minimalistic wiki and notes application for organizing content, built with Node.js and Express.

## Features

- RESTful API for managing notes and content
- JWT-based authentication for secure API access
- Session management with MariaDB store
- MariaDB database for persistent data storage
- OpenAPI/Swagger documentation
- Modern and clean API design
- CORS enabled for cross-origin requests

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- MariaDB (v10.4 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure MariaDB:
   - Create a new database named `notion_clone`
   - Update database configuration in `server.js` if needed:
     ```javascript
     const dbConfig = {
         host: 'localhost',
         user: 'root',
         password: 'root',
         database: 'notion_clone'
     };
     ```

## Running the Application

### Development Mode
To run the application in development mode with auto-reload:
```bash
npm run dev
```

### Production Mode
To run the application in production mode:
```bash
npm start
```

## API Documentation

After starting the server, you can access the API documentation at:
```
http://localhost:3000/api-docs
```

The API documentation is generated using OpenAPI/Swagger and provides:
- Detailed endpoint descriptions
- Request/response schemas
- Authentication requirements
- Interactive API testing interface

## Project Structure

```
├── server.js           # Main application entry point
├── package.json        # Project dependencies and scripts
├── openapi.yaml        # API documentation and specifications
└── README.md          # Project documentation
```

## License

ISC License


## API Documentation

### Authentication
The API uses JWT (JSON Web Token) for authentication. To access protected endpoints:

1. First, obtain a JWT token by making a POST request to `/login` with your credentials
2. Include the token in the Authorization header of subsequent requests:
```
Authorization: Bearer your-jwt-token
```


The API documentation is available through Swagger UI at:
```
http://localhost:5001/api-docs
```

## Authentication

The API uses Bearer token authentication. To access protected endpoints:

1. Get your token by sending a POST request to `/login` with:
```json
{
    "username": "root",
    "password": "root"
}
```

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

## Dependencies

All required dependencies are listed in `requirements.txt` with their specific versions:

- express@4.18.2 - Web framework
- cors@2.8.5 - Cross-origin resource sharing
- swagger-jsdoc@6.2.8 - API documentation generator
- swagger-ui-express@5.0.0 - API documentation UI
- yamljs@0.3.0 - YAML parser and encoder
- nodemon@3.0.2 - Development server with auto-reload

