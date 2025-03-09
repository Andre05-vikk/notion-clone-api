
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /sessions - Login
router.post('/sessions', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            code: 400,
            error: 'Bad Request',
            message: 'Username and password are required'
        });
    }

    try {
        const pool = req.app.locals.pool;
        const conn = await pool.getConnection();

        const rows = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            conn.release();
            return res.status(401).json({
                code: 401,
                error: 'Unauthorized',
                message: 'Invalid username or password'
            });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            conn.release();
            return res.status(401).json({
                code: 401,
                error: 'Unauthorized',
                message: 'Invalid username or password'
            });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            req.app.locals.JWT_SECRET,
            { expiresIn: '7d' }
        );

        conn.release();
        return res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({
            code: 500,
            error: 'Internal Server Error',
            message: 'Failed to authenticate'
        });
    }
});

// DELETE /sessions - Logout
router.delete(
    '/sessions',
    (req, res, next) => req.app.locals.authenticateToken(req, res, next),
    async (req, res) => {
        try {
            // JWT is stateless, cannot invalidate server-side
            // Client should discard the token
            return res.status(204).send();
        } catch (error) {
            console.error('Error processing logout:', error);
            return res.status(500).json({
                code: 500,
                error: 'Internal Server Error',
                message: 'Failed to process logout'
            });
        }
    }
);

module.exports = router;