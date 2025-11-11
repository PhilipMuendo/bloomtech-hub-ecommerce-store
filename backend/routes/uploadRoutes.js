import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import requireAuth from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/roleAuth.js';
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

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only image uploads are allowed'));
    }
    cb(null, true);
  }
});

router.use(requireAuth, requireRole(['admin', 'superadmin']));

// POST /api/upload
router.post('/', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 5MB.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Only image files (JPG, PNG, GIF, WebP) are allowed.' });
      }
      return res.status(400).json({ error: err.message || 'Upload failed.' });
    }

    if (err) {
      return next(err);
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let host = req.get('host');
    const forwardedHost = req.get('x-forwarded-host');
    const forwardedProto = req.get('x-forwarded-proto');

    if (forwardedHost && forwardedProto) {
      host = forwardedHost;
      const protocol = forwardedProto;
      const fileUrl = `${protocol}://${host}/public/lovable-uploads/${req.file.filename}`;
      return res.json({ url: fileUrl });
    }

    const fileUrl = `${req.protocol}://${host}/public/lovable-uploads/${req.file.filename}`;
    return res.json({ url: fileUrl });
  });
});

export default router; 