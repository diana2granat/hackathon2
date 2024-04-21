const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

// Import the db object
const db = require('../config/database');


// Add a middleware to check if the user is authenticated
const isAuthenticated = async (req, res, next) => {
    try {
        if (req.session && req.session.user) {
            // Check if the user exists in the database
            const user = await db('users').where('id', req.session.user.id).first();
            if (user) {
                // User is authenticated and exists in the database, proceed to the next middleware/route handler
                return next();
            }
        }
        // If session or user not found or user doesn't exist in the database, send a 401 Unauthorized response
        res.status(401).json({ message: 'Unauthorized' });
    } catch (error) {
        console.error('Error checking authentication:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

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

        // Redirect user to account.html after successful registration
        // Set user session
        req.session.user = newUser[0]; // Assuming newUser[0] contains user information
        res.redirect('/account.html');

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// POST /login: Allow users to login by providing a username and password. 
router.post('/login', isAuthenticated, [
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
        // Redirect user to account.html
        // Set user session
        req.session.user = user; // Assuming 'user' contains user information
        res.redirect('/account.html');
        
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /saveExpenses: Save user's expenses to the database
router.post('/saveExpenses', isAuthenticated, async (req, res) => {
    try {
        const { expenses, savings, totalSavings } = req.body;
        const userId = req.session.user.id; // Assuming user ID is stored in req.session.user

        // Check if the user already has expense records for the current year
        const existingExpenses = await db('user_expenses').where('user_id', userId).andWhere('year', new Date().getFullYear());

        if (existingExpenses.length === 0) {
            // If the user does not have expense records for the current year, insert new records
            await Promise.all(expenses.map(async (expense, index) => {
                const savingAmount = savings && savings[index] !== undefined ? savings[index] : null;
                await db('user_expenses').insert({
                    user_id: userId,
                    month: index + 1, // Assuming index starts from 0 and represents months
                    year: new Date().getFullYear(),
                    expense_amount: expense,
                    savings_amount: savingAmount,
                    total_savings: totalSavings
                });
            }));
        } else {
            // If the user already has expense records for the current year, update existing records
            await Promise.all(existingExpenses.map(async (record, index) => {
                const savingAmount = savings && savings[index] !== undefined ? savings[index] : null;
                await db('user_expenses').where('id', record.id).update({
                    expense_amount: expenses[index],
                    savings_amount: savingAmount,
                    total_savings: totalSavings
                });
            }));
        }

        res.status(200).json({ message: 'Expenses saved successfully' });
    } catch (error) {
        console.error('Error saving expenses:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /user: Fetch user's data
router.get('usersbase/user', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id; // Assuming user ID is stored in req.session.user

        // Retrieve user's data from the database
        const userData = await db('users').select('name').where('id', userId).first();

        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Respond with user's data
        res.json(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
