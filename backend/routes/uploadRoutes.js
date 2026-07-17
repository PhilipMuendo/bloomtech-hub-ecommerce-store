import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import requireAuth from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/roleAuth.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '../public/uploads');

// First-line filter on the declared MIME type. The sharp re-encode below is
// the real guarantee: output is always WebP, so a spoofed Content-Type can
// never result in a non-image (e.g. HTML) being served from this origin.
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const upload = multer({
  storage: multer.memoryStorage(),
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
  upload.single('image')(req, res, async (err) => {
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

    try {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });

      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;

      // Normalize every upload: auto-orient from EXIF, cap the longest edge at
      // 1600px, re-encode as WebP. Typically cuts a phone photo ~90% in size.
      await sharp(req.file.buffer)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(UPLOAD_DIR, filename));

      // Relative URL — resolves against whatever domain serves the site, so
      // stored image URLs survive domain changes (unlike absolute URLs).
      return res.json({ url: `/public/uploads/${filename}` });
    } catch (e) {
      // sharp throws on anything that isn't a decodable image.
      return res.status(400).json({ error: 'File is not a valid image.' });
    }
  });
});

export default router;
