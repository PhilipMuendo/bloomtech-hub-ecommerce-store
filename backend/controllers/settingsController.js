import db from '../sequelize_models/index.js';
import sanitizeHtml from 'sanitize-html';

const { SiteSetting } = db;

const sanitizeUrl = (value) => {
  if (!value) return null;
  const cleaned = String(value).trim();
  if (!/^https?:\/\//i.test(cleaned)) return null; // allow only http/https
  if (cleaned.length > 300) return null;
  return cleaned;
};

const cleanText = (value, max = 200) => {
  if (!value) return null;
  const cleaned = sanitizeHtml(String(value), { allowedTags: [], allowedAttributes: {} }).trim();
  return cleaned.slice(0, max) || null;
};

export const getSettings = async (req, res) => {
  try {
    let settings = await SiteSetting.findByPk(1);
    if (!settings) {
      // Create default settings if none exist
      settings = await SiteSetting.create({
        id: 1,
        companyName: 'BLOOMTECH',
        companyTagline: 'Hub',
        companyFullName: 'BLOOMTECH Hub',
        logoType: 'text',
        logoTextInitials: 'BT',
      });
    }
    res.json(settings);
  } catch (err) {
    console.error('getSettings error', err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let settings = await SiteSetting.findByPk(1);
    if (!settings) {
      settings = await SiteSetting.create({ id: 1 });
    }

    const body = req.body || {};
    const payload = {
      companyName: cleanText(body.companyName, 120),
      companyTagline: cleanText(body.companyTagline, 120),
      companyFullName: cleanText(body.companyFullName, 200),
      logoType: ['text', 'image'].includes(body.logoType) ? body.logoType : settings.logoType || 'text',
      logoTextInitials: cleanText(body.logoTextInitials, 6),

      logoImageSrc: sanitizeUrl(body.logoImageSrc),
      logoImageDarkSrc: sanitizeUrl(body.logoImageDarkSrc),
      logoIconSrc: sanitizeUrl(body.logoIconSrc),

      twitterHandle: cleanText(body.twitterHandle, 60),
      ogImage: sanitizeUrl(body.ogImage),

      facebookUrl: sanitizeUrl(body.facebookUrl),
      twitterUrl: sanitizeUrl(body.twitterUrl),
      instagramUrl: sanitizeUrl(body.instagramUrl),
      linkedinUrl: sanitizeUrl(body.linkedinUrl),

      updatedBy: req.user.id,
    };

    await settings.update(payload);
    res.json(settings);
  } catch (err) {
    console.error('updateSettings error', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

