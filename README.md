# Notion Clone

A minimalistic wiki and notes application for organizing content, built with Node.js and Express.

## Features

- RESTful API for managing notes and content
- OpenAPI/Swagger documentation
- Modern and clean API design
- CORS enabled for cross-origin requests

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd notion-clone
```

2. Install dependencies using requirements.txt:
```bash
npm install -g $(cat requirements.txt)
```

This will install all required packages globally. Alternatively, you can install locally with:
```bash
npm install $(cat requirements.txt)
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

The API documentation is available through Swagger UI at:
```
http://localhost:5001/api-docs
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

## License

ISC
