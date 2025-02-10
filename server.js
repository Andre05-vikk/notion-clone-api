const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load OpenAPI specification
const swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// In-memory database
let tasks = [];

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'operational',
        version: '1.0.0',
        documentation: '/api-docs'
    });
});

// GET /tasks - Get all tasks
app.get('/tasks', (req, res) => {
    try {
        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

// POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
    try {
        const { title, description, status } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({
                error: 'Invalid input parameters',
                details: 'Title and description are required'
            });
        }
        
        const task = {
            id: Date.now().toString(),
            title,
            description,
            status: status || 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        tasks.push(task);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

// GET /tasks/:id - Get a specific task
app.get('/tasks/:id', (req, res) => {
    try {
        const task = tasks.find(t => t.id === req.params.id);
        if (!task) {
            return res.status(404).json({
                error: 'Resource not found',
                details: 'Task with specified ID does not exist'
            });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

// PUT /tasks/:id - Update a task
app.put('/tasks/:id', (req, res) => {
    try {
        const { title, description, status } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({
                error: 'Invalid input parameters',
                details: 'Title and description are required'
            });
        }
        
        const taskIndex = tasks.findIndex(t => t.id === req.params.id);
        if (taskIndex === -1) {
            return res.status(404).json({
                error: 'Resource not found',
                details: 'Task with specified ID does not exist'
            });
        }
        
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            title,
            description,
            status: status || tasks[taskIndex].status,
            updatedAt: new Date().toISOString()
        };
        
        res.json(tasks[taskIndex]);
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
    try {
        const taskIndex = tasks.findIndex(t => t.id === req.params.id);
        if (taskIndex === -1) {
            return res.status(404).json({
                error: 'Resource not found',
                details: 'Task with specified ID does not exist'
            });
        }
        
        tasks.splice(taskIndex, 1);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});