const express = require('express');
const multer  = require('multer');
const cors    = require('cors');
const { Vimeo } = require('vimeo');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = process.env.PORT || 3000;

// Only allow your Webflow front‑end
app.use(
  cors({
    origin: 'https://media-five-social-media-agency.webflow.io',
    methods: ['POST','GET'],
    allowedHeaders: ['Content-Type']
  })
);

// Initialize Vimeo client
const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

// (Optional) serve any static files you put in /public
app.use(express.static('public'));

// Upload endpoint
app.post('/upload', upload.single('video'), (req, res) => {
  const filePath = req.file.path;
  client.upload(
    filePath,
    {
      name: req.body.title || 'Untitled',
      description: req.body.description || ''
    },
    // onSuccess
    uri => {
      console.log('✅ Upload complete:', uri);
      const videoId = uri.split('/').pop();
      const watchUrl = `https://vimeo.com/${videoId}`;
      res.json({ url: watchUrl });
    },
    // onProgress
    (bytesUploaded, bytesTotal) => {
      const pct = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
      console.log(`🔄 ${bytesUploaded}/${bytesTotal} bytes (${pct}%)`);
    },
    // onError
    error => {
      console.error('❌ Upload failed:', error);
      res.status(500).json({ error: error.message || error });
    }
  );
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Listening on port ${port}`);
});
