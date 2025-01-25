require('dotenv').config();
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var dns = require('dns');
var app = express();

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(bodyParser.urlencoded({ extended: false }));

// Store URLs in memory (for simplicity in this example)
var urlDatabase = {};
var shortUrlCounter = 1;

// Serve static files
app.use(express.static('public'));

// Main route
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// API to shorten a URL
app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;

  // Validate the URL format
  const urlRegex = /^(http:\/\/|https:\/\/)([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Use DNS lookup to verify if the URL domain exists
  const hostname = originalUrl.replace(/^(http:\/\/|https:\/\/)/, '').split('/')[0];
  dns.lookup(hostname, function (err) {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // If the URL is valid, store it and return the shortened URL
    const shortUrl = shortUrlCounter++;
    urlDatabase[shortUrl] = originalUrl;
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// API to redirect from shortened URL
app.get('/api/shorturl/:shortUrl', function (req, res) {
  const shortUrl = req.params.shortUrl;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for this id' });
  }
});

// Your app listening on port 3000 or from environment
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

