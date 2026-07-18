import db from '../sequelize_models/index.js';
import sanitizeHtml from 'sanitize-html';
import AuditService from '../services/auditService.js';

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

const cleanInt = (value, fallback, { min = 0, max = 100000 } = {}) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
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
        logoIconSrc: '/logo-icon.png',
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

    const previousValues = settings.toJSON();

    const body = req.body || {};
    const payload = {
      companyName: cleanText(body.companyName, 120),
      companyTagline: cleanText(body.companyTagline, 120),
      companyFullName: cleanText(body.companyFullName, 200),
      logoType: ['text', 'image'].includes(body.logoType) ? body.logoType : settings.logoType || 'text',

      logoImageSrc: sanitizeUrl(body.logoImageSrc),
      logoIconSrc: sanitizeUrl(body.logoIconSrc),

      facebookUrl: sanitizeUrl(body.facebookUrl),
      twitterUrl: sanitizeUrl(body.twitterUrl),
      instagramUrl: sanitizeUrl(body.instagramUrl),
      linkedinUrl: sanitizeUrl(body.linkedinUrl),

      contactPhone: cleanText(body.contactPhone, 30),
      contactWhatsapp: cleanText(body.contactWhatsapp, 30),
      contactEmail: cleanText(body.contactEmail, 120),
      contactAddress: cleanText(body.contactAddress, 500),
      businessHours: cleanText(body.businessHours, 120),

      bankAccountName: cleanText(body.bankAccountName, 120),
      bankAccountNumber: cleanText(body.bankAccountNumber, 60),
      bankName: cleanText(body.bankName, 120),
      bankBranch: cleanText(body.bankBranch, 120),
      bankSwiftCode: cleanText(body.bankSwiftCode, 30),
      bankCode: cleanText(body.bankCode, 30),

      lowStockThreshold: cleanInt(body.lowStockThreshold, settings.lowStockThreshold ?? 10, { min: 1, max: 10000 }),
      maintenanceMode: Boolean(body.maintenanceMode),
      announcementEnabled: Boolean(body.announcementEnabled),
      announcementText: cleanText(body.announcementText, 200),

      updatedBy: req.user.id,
    };

    await settings.update(payload);

    await AuditService.logAuditEvent({
      performedBy: req.user.id,
      action: 'settings_updated',
      entityType: 'settings',
      entityId: settings.id,
      details: 'Site settings updated',
      previousValues,
      newValues: settings.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json(settings);
  } catch (err) {
    console.error('updateSettings error', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
