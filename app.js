const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const usersbaseRouter = require('./server/routes/usersbase');

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
