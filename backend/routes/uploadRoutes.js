import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/lovable-uploads');
    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Get the correct host for the file URL
  let host = req.get('host');
  
  // Check if we're behind ngrok
  const forwardedHost = req.get('x-forwarded-host');
  const forwardedProto = req.get('x-forwarded-proto');
  
  if (forwardedHost && forwardedProto) {
    // Use ngrok URL if available
    host = forwardedHost;
    const protocol = forwardedProto;
    const fileUrl = `${protocol}://${host}/public/lovable-uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } else {
    // Fallback to regular host
    const fileUrl = `${req.protocol}://${host}/public/lovable-uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  }
});

export default router; 