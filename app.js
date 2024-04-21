const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session); // Import connect-pg-simple
const app = express();
const bodyParser = require('body-parser');
const usersbaseRouter = require('./server/routes/usersbase');
const crypto = require('crypto');
const cors = require('cors');
const { Pool } = require('pg'); // Import pg.Pool
const dbConfig = require('./server/config/database');

app.use(cors());

// Generate a random secret key
// const secretKey = crypto.randomBytes(32).toString('hex');
// console.log("Generated Secret Key:", secretKey);
const secretKey = 'keysecret';

// Create a new pg.Pool instance
const pgPool = new Pool({
    connectionString: dbConfig.client.connectionSettings.connectionString,
    // Add other pool configuration options as needed
});

// Session middleware
app.use(session({
    store: new pgSession({
        pool: pgPool, // Use the pg.Pool instance
        tableName: 'sessions'
    }),
    secret: secretKey,
    resave: false,
    saveUninitialized: true
}));
// Serve static files from the 'public' directory (html pages)
app.use(express.static('public'));

// Parse JSON bodies
app.use(bodyParser.json());

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));


// Mount the router with the '/usersbase' prefix
app.use('/usersbase', usersbaseRouter);

// Define a default route to handle invalid requests
app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});


// Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
