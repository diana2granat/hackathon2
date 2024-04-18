const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
// const fs = require('fs');
// const path = require('path');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

// Import the db object
const db = require('../config/database');

// POST /register: Allow users to register by providing a username and password. 
router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('lastName').notEmpty().withMessage('Last Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
    ], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, lastName, email, username, password } = req.body;

        // Check if username already exists in the database
        const existingUser = await db('users').where('username', username).first();
        if (existingUser) {
            return res.status(400).json({ message: 'Error: Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        const newUser = await db('users').insert({
            name,
            last_name: lastName,
            email,
            username,
            password: hashedPassword
        }).returning('*');

        // res.status(201).json({ message: 'User registered successfully', user: newUser[0] });
        // Redirect user to account.html after successful registration
        res.redirect('/account.html');

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
    ], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // Retrieve user from the database
        const user = await db('users').where('username', username).first();
        if (!user) {
            return res.status(401).json({ message: 'Error: User not found' });
        }

        // Compare the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Error: Invalid username or password' });
        }

        // If passwords match, login successful
        // res.json({ message: 'Login successful', user: { username: user.username } });
        // Redirect user to account.html after successful registration
        res.redirect('/account.html');
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router;
