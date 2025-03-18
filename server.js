
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const mariadb = require('mariadb');
const jwt = require('jsonwebtoken');

// Load environment variables (if .env is present)
require('dotenv').config();

// Default JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// DB config
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'notion_clone',
    connectionLimit: 5
};

const app = express();
const pool = mariadb.createPool(dbConfig);

app.locals.pool = pool;
app.locals.JWT_SECRET = JWT_SECRET;

// Attempt DB connection
(async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('Database connection established successfully');

        // Check tables
        try {
            await conn.query('SELECT 1 FROM users LIMIT 1');
            await conn.query('SELECT 1 FROM tasks LIMIT 1');
            console.log('Database tables verified');
        } catch (tableError) {
            console.error('Database tables not found. Please run database.sql:', tableError.message);
        }
    } catch (err) {
        console.error('Database connection failed:', err);
    } finally {
        if (conn) conn.release();
    }
})();

// Middleware
app.use(cors());
app.use(express.json());

// Load OpenAPI
const swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));
app.use('/', swaggerUi.serve);
app.get('/', swaggerUi.setup(swaggerDocument));

// Bearer auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            code: 401,
            error: 'Unauthorized',
            message: 'Authentication token is required'
        });
    }

    jwt.verify(token, app.locals.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                code: 403,
                error: 'Forbidden',
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

app.locals.authenticateToken = authenticateToken;

// Use route modules
app.use('/users', require('./routes/users'));
app.use('/tasks', require('./routes/tasks'));
app.use('/', require('./routes/auth'));

// Global error handler
app.use((err, req, res) => {
    console.error('Unhandled error:', err);
    
    // Determine if we have a specific status code from the error
    const statusCode = err.statusCode || 500;
    const errorType = statusCode === 500 ? 'Internal Server Error' : err.type || 'Error';
    const errorMessage = err.message || 'An unexpected error occurred';
    
    res.status(statusCode).json({
        code: statusCode,
        error: errorType,
        message: errorMessage
    });
    // We don't call next() here as we've ended the response cycle
});

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API documentation at http://localhost:${PORT}`);
});

// Export for testing
module.exports = {app, server};