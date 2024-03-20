const express = require('express');
const mongoose = require('mongoose');
const UrlMapping = require('./models/UrlMapping');
const path = require('path');
const validUrl = require('valid-url');
const crypto = require('crypto'); // Import crypto module

const app = express();
const PORT = process.env.PORT || 1126;

// MongoDB setup...
mongoose.connect('mongodb://localhost:27017/url_shortener', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Middleware...
app.use(express.json()); // Parse JSON bodies

// Function to generate short IDs
function generateShortId(originalUrl) {
    // Generate a unique hash for the original URL using SHA-256
    const hash = crypto.createHash('sha256').update(originalUrl).digest('hex');
    // Take the first 6 characters of the hash as the short ID
    return hash.substring(0, 6);
}

// Handling POST request to shorten URL
app.post('/api/shorten', async (req, res) => {
    const { originalUrl } = req.body;

    try {
        // Validate original URL
        if (!validUrl.isWebUri(originalUrl)) {
            return res.status(400).json({ error: 'Invalid URL' });
        }

        let urlMapping = await UrlMapping.findOne({ originalUrl });

        // Check if the URL already exists in the database
        if (urlMapping) {
            return res.json({ shortUrl: `http://localhost:${PORT}/${urlMapping.shortId}` });
        }

        // Generate short ID
        const shortId = generateShortId(originalUrl);

        // Create new URL mapping
        urlMapping = new UrlMapping({
            originalUrl,
            shortId
        });

        // Save to database
        await urlMapping.save();

        // Return short URL in response
        res.json({ shortUrl: `http://localhost:${PORT}/${shortId}` });
    } catch (error) {
        console.error('Error shortening URL:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Handling short URL redirection
app.get('/:shortId', async (req, res) => {
    const { shortId } = req.params;

    try {
        // Find the original URL associated with the short ID
        const urlMapping = await UrlMapping.findOne({ shortId });

        if (!urlMapping) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        // Redirect to the original URL
        res.redirect(urlMapping.originalUrl);
    } catch (error) {
        console.error('Error redirecting:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server...
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Serving static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handling root URL ("/")
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});







