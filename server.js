const express = require('express');
const multer  = require('multer');
const cors = require("cors");
const { Vimeo } = require('vimeo');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "https://media-five-social-media-agency.webflow.io/", // Change to your frontend origin in production
    methods: ["POST", "GET"],
    allowedHeaders: ["Content-Type"],
  })
);

// Initialize Vimeo client
const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

// Serve static files from public/
app.use(express.static('public'));

// Handle video upload
app.post('/upload', upload.single('video'), function(req, res) {
  var filePath = req.file.path;
  client.upload(
    filePath,
    {
      name: req.body.title || 'Untitled',
      description: req.body.description || ''
    },
    // onSuccess → return clean URL
    function(uri) {
      console.log('✅ Upload complete! Video URI:', uri);
      var parts = uri.split('/');
      var videoId = parts[parts.length - 1];
      var watchUrl = 'https://vimeo.com/' + videoId;
      res.json({ url: watchUrl });
    },
    // onProgress → server-side logging
    function(bytesUploaded, bytesTotal) {
      var pct = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
      console.log('🔄 ' + bytesUploaded + '/' + bytesTotal + ' bytes uploaded (' + pct + '%)');
    },
    // onError → return JSON error
    function(error) {
      console.error('❌ Upload failed:', error);
      res.status(500).json({ error: error.message || error });
    }
  );
});

// Start the server
app.listen(port, function() {
  console.log('🚀 Server listening at http://localhost:' + port);
});
