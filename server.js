const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const mariadb = require('mariadb');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'notion_clone'
};

const app = express();
const pool = mariadb.createPool(dbConfig);

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
    secret: JWT_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 1 week
    resave: false,
    saveUninitialized: false
}));

// Load OpenAPI specification
const swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));
app.use('/', swaggerUi.serve);
app.get('/', swaggerUi.setup(swaggerDocument));

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized', details: 'Authentication token is required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden', details: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// API Routes
// DELETE task endpoint
app.delete('/tasks/:taskId', authenticateToken, async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const taskId = parseInt(req.params.taskId);

        // Check if task exists and belongs to user
        const task = await conn.query(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, req.user.id]
        );

        if (task.length === 0) {
            conn.release();
            return res.status(404).json({
                error: 'Not Found',
                details: 'Task not found or you don\'t have permission to delete it'
            });
        }

        // Delete the task
        await conn.query('DELETE FROM tasks WHERE id = ?', [taskId]);
        conn.release();

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: 'Failed to delete task'
        });
    }
});

// PATCH task endpoint
app.patch('/tasks/:taskId', authenticateToken, async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const taskId = parseInt(req.params.taskId);
        const { title, description, status } = req.body;

        // Check if task exists and belongs to user
        const task = await conn.query(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, req.user.id]
        );

        if (task.length === 0) {
            conn.release();
            return res.status(404).json({
                error: 'Not Found',
                details: 'Task not found or you don\'t have permission to update it'
            });
        }

        // Build update query dynamically based on provided fields
        const updates = ['updated_at = ?'];
        const values = [new Date().toISOString()];
        
        if (title !== undefined) {
            if (title.length < 1) {
                conn.release();
                return res.status(400).json({
                    error: 'Bad Request',
                    details: 'Title must be at least 1 character long'
                });
            }
            updates.push('title = ?');
            values.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (status !== undefined) {
            if (!['pending', 'in_progress', 'completed'].includes(status)) {
                conn.release();
                return res.status(400).json({
                    error: 'Bad Request',
                    details: 'Status must be one of: pending, in_progress, completed'
                });
            }
            updates.push('status = ?');
            values.push(status);
        }

        if (updates.length === 1) { // Only updated_at is present
            conn.release();
            return res.status(400).json({
                error: 'Bad Request',
                details: 'No fields to update provided'
            });
        }

        // Add taskId to values array
        values.push(taskId);

        // Update the task
        await conn.query(
            `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Get updated task
        const [updatedTask] = await conn.query(
            'SELECT id, title, description, status, created_at as createdAt, updated_at as updatedAt FROM tasks WHERE id = ?',
            [taskId]
        );
        conn.release();

        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: 'Failed to update task'
        });
    }
});

app.delete('/sessions', authenticateToken, async (req, res) => {
    try {
        // Clear session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({
                    error: 'Internal Server Error',
                    details: 'Failed to delete session'
                });
            }
        });

        // Since we can't actually invalidate JWT tokens (they are stateless),
        // we'll send a success response indicating the session is cleared
        // The client should remove the token from their storage
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: 'Failed to delete session'
        });
    }
});

// User Routes
app.post('/users', async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({
            error: 'Bad Request',
            details: 'Username and password are required'
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            error: 'Bad Request',
            details: 'Password must be at least 8 characters long'
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
        return res.status(400).json({
            error: 'Bad Request',
            details: 'Invalid email format'
        });
    }

    try {
        const connection = await pool.getConnection();

        // Check if username already exists
        const [existingUser] = await connection.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser) {
            connection.release();
            return res.status(409).json({
                error: 'Conflict',
                details: 'Username already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await connection.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        // Get created user
        const [user] = await connection.query(
            'SELECT id, username, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?',
            [result.insertId]
        );

        connection.release();
        res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: 'Failed to create user'
        });
    }
});

app.get('/users', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const users = await connection.query(
            'SELECT id, username, created_at as createdAt, updated_at as updatedAt FROM users'
        );
        connection.release();
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: 'Failed to get users'
        });
    }
});

app.get('/users/:userId', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [user] = await connection.query(
            'SELECT id, username, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?',
            [req.params.userId]
        );

        if (!user) {
            connection.release();
            return res.status(404).json({
                error: 'Not Found',
                details: 'User not found'
            });
        }

        connection.release();
        res.json(user);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: 'Failed to get user'
        });
    }
});

app.patch('/users/:userId', authenticateToken, async (req, res) => {
    const { password } = req.body;

    // Validate input
    if (!password || password.length < 8) {
        return res.status(400).json({
            error: 'Bad Request',
            details: 'Password must be at least 8 characters long'
        });
    }

    try {
        const connection = await pool.getConnection();

        // Check if user exists
        const [user] = await connection.query('SELECT id FROM users WHERE id = ?', [req.params.userId]);
        if (!user) {
            connection.release();
            return res.status(404).json({
                error: 'Not Found',
                details: 'User not found'
            });
        }

        // Only allow users to update their own password
        if (user.id !== req.user.id) {
            connection.release();
            return res.status(403).json({
                error: 'Forbidden',
                details: 'You can only update your own password'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password
        await connection.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.params.userId]
        );

        // Get updated user
        const [updatedUser] = await connection.query(
            'SELECT id, username, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?',
            [req.params.userId]
        );

        connection.release();
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: 'Failed to update user'
        });
    }
});

app.delete('/users/:userId', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        // Check if user exists
        const [user] = await connection.query('SELECT id FROM users WHERE id = ?', [req.params.userId]);
        if (!user) {
            connection.release();
            return res.status(404).json({
                error: 'Not Found',
                details: 'User not found'
            });
        }

        // Only allow users to delete their own account
        if (user.id !== req.user.id) {
            connection.release();
            return res.status(403).json({
                error: 'Forbidden',
                details: 'You can only delete your own account'
            });
        }

        // Delete user's tasks first (due to foreign key constraint)
        await connection.query('DELETE FROM tasks WHERE user_id = ?', [req.params.userId]);

        // Delete user
        await connection.query('DELETE FROM users WHERE id = ?', [req.params.userId]);

        connection.release();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: 'Failed to delete user'
        });
    }
});

// Sessions Routes
app.post('/sessions', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            error: 'Bad Request',
            details: 'Username and password are required'
        });
    }

    try {
        const connection = await pool.getConnection();
        const [user] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
        connection.release();

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                error: 'Unauthorized',
                details: 'Invalid username or password'
            });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            details: 'An unexpected error occurred'
        });
    }
});

app.get('/tasks', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        if (page < 1 || limit < 1) {
            return res.status(400).json({
                error: 'Bad Request',
                details: 'Page and limit must be positive integers'
            });
        }

        const connection = await pool.getConnection();
        const tasks = await connection.query(
            'SELECT id, title, description, status, user_id, created_at as createdAt, updated_at as updatedAt FROM tasks WHERE user_id = ? LIMIT ? OFFSET ?',
            [req.user.id, limit, offset]
        );
        connection.release();

        // Format the response to match the API spec
        const formattedTasks = tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            user_id: task.user_id,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
        }));

        res.json(formattedTasks);
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            details: 'An unexpected error occurred'
        });
    }
});

app.post('/tasks', authenticateToken, async (req, res) => {
    const { title, description, status } = req.body;
    if (!title) {
        return res.status(400).json({
            error: 'Bad Request',
            details: 'Title is required'
        });
    }
    try {
        const connection = await pool.getConnection();
        const now = new Date().toISOString();
        const result = await connection.query(
            'INSERT INTO tasks (title, description, status, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description || null, status || 'pending', req.user.id, now, now]
        );
        
        // Fetch the created task to return the complete response
        const [task] = await connection.query(
            'SELECT id, title, description, status, created_at as createdAt, updated_at as updatedAt FROM tasks WHERE id = ?',
            [result.insertId]
        );
        connection.release();
        
        res.status(201).json({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            details: 'An unexpected error occurred'
        });
    }
});



const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/`);
});
