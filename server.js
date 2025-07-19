const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const { Vimeo } = require('vimeo');
require('dotenv').config();

const app = express();
// Allow only your Webflow site to talk to us:
app.use(cors({
  origin: 'https://YOUR-WEBFLOW-DOMAIN.webflow.io'
}));

// Serve static files if you have any
app.use(express.static('public'));

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 500 * 1024 * 1024 } // 500 MB max
});

const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

app.post('/upload', upload.single('video'), function(req, res) {
  client.upload(
    req.file.path,
    {
      name: req.body.title || 'Untitled',
      description: req.body.description || ''
    },
    // onSuccess
    function(uri) {
      console.log('✅ Upload complete! URI: ' + uri);
      var parts = uri.split('/');
      var videoId = parts[parts.length - 1];
      res.json({ url: 'https://vimeo.com/' + videoId });
    },
    // onProgress
    function(bytesUploaded, bytesTotal) {
      var pct = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
      console.log('🔄 ' + bytesUploaded + '/' + bytesTotal + ' bytes uploaded (' + pct + '%)');
    },
    // onError
    function(error) {
      console.error('❌ Upload failed: ' + error);
      res.status(500).json({ error: error.message || error });
    }
  );
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('🚀 Server listening on http://localhost:' + port);
});
