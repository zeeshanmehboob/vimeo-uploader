// server.js
const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const { Vimeo } = require('vimeo');
require('dotenv').config();

const app = express();

// ── CORS SETUP ────────────────────────────────────────────────────────────────
// Only allow requests from your Webflow staging origin:
const allowedOrigins = [
  'https://media-five-social-media-agency.webflow.io'
];

app.use(cors({
  origin(origin, callback) {
    // allow requests with no origin (e.g. curl, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS blocked: Origin not allowed'));
  },
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.options('*', cors());

// ── STATIC FILES ──────────────────────────────────────────────────────────────
app.use(express.static('public'));

// ── MULTER CONFIG ────────────────────────────────────────────────────────────
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 500 * 1024 * 1024 }  // 500 MB max file size
});

// ── VIMEO CLIENT ──────────────────────────────────────────────────────────────
const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

// ── UPLOAD ENDPOINT ──────────────────────────────────────────────────────────
app.post('/upload', upload.single('video'), (req, res) => {
  client.upload(
    req.file.path,
    {
      name: req.body.title || 'Untitled',
      description: req.body.description || ''
    },
    // onSuccess
    uri => {
      console.log('✅ Upload complete! URI:', uri);
      const videoId = uri.split('/').pop();
      res.json({ url: 'https://vimeo.com/' + videoId });
    },
    // onProgress
    (bytesUploaded, bytesTotal) => {
      const pct = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
      console.log('🔄 Progress:', pct + '%');
    },
    // onError
    error => {
      console.error('❌ Upload failed:', error);
      res.status(500).json({ error: error.message || error });
    }
  );
});

// ── START SERVER ──────────────────────────────────────────────────────────────
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('🚀 Server listening on http://localhost:' + port);
});
