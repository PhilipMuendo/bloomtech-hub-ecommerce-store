# Branding Customization Guide

This guide explains how to customize the BloomTech Hub branding, including logos, favicons, and brand colors.

---

## 🎯 Quick Start (2 Minutes)

**To change your company name and initials:**

1. Open `src/config/branding.ts`
2. Edit these values:
   ```typescript
   company: {
     name: 'YOUR COMPANY',     // Change this
     tagline: 'Your Tagline',  // Change this
     fullName: 'YOUR COMPANY Your Tagline',
   },
   
   logo: {
     text: {
       initials: 'YC',  // Change to your initials
     }
   }
   ```
3. Save and refresh your browser - changes appear instantly!

All branding configuration is centralized in one file: **`src/config/branding.ts`**

---

## Changing the Logo

### Option 1: Text-Based Logo (Current Setup)

Edit `src/config/branding.ts`:

```typescript
logo: {
  type: 'text',
  text: {
    initials: 'BT',              // Change to your initials
    gradientFrom: 'from-primary', // Tailwind gradient start color
    gradientTo: 'to-accent',      // Tailwind gradient end color
  },
}
```

And update the company name:

```typescript
company: {
  name: 'BLOOMTECH',    // Main brand name
  tagline: 'Hub',       // Tagline below main name
  fullName: 'BLOOMTECH Hub',
}
```

### Option 2: Image-Based Logo

1. **Prepare your logo files:**
   - Main logo: `logo.png` (recommended: 400x100px or similar, transparent background)
   - Logo icon: `logo-icon.png` (recommended: 80x80px square)
   - Dark mode logo (optional): `logo-dark.png`

2. **Place files in `public/` folder:**
   ```
   public/
   ├── logo.png
   ├── logo-icon.png
   └── logo-dark.png (optional)
   ```

3. **Update configuration in `src/config/branding.ts`:**

```typescript
logo: {
  type: 'image',  // Change from 'text' to 'image'
  
  image: {
    src: '/logo.png',
    alt: 'Your Company Logo',
    width: 180,
    height: 40,
    
    // Optional: separate dark mode logo
    darkSrc: '/logo-dark.png',
    
    // Small icon version for mobile
    iconSrc: '/logo-icon.png',
    iconWidth: 40,
    iconHeight: 40,
  },
}
```

---

## Changing Favicons

### Method 1: Simple Replacement (Recommended for Quick Changes)

Replace the existing favicon:

1. Create or obtain your favicon as a `.ico` file
2. Replace `public/favicon.ico` with your new file
3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

### Method 2: Multi-Format Favicons (Recommended for Production)

For best cross-platform compatibility, provide multiple sizes:

1. **Generate favicons** using a tool like:
   - [Favicon Generator](https://favicon.io/)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)

2. **Place the generated files in `public/`:**
   ```
   public/
   ├── favicon.ico           # Main favicon (16x16, 32x32, 48x48)
   ├── favicon-16x16.png    # 16x16 PNG
   ├── favicon-32x32.png    # 32x32 PNG
   ├── apple-touch-icon.png # 180x180 PNG for iOS
   └── og-image.png         # 1200x630 PNG for social sharing
   ```

3. The `index.html` is already configured to reference these files

---

## Changing Social Media Preview Images

When someone shares your site on Facebook, Twitter, LinkedIn, etc.:

1. Create an image: **1200 x 630 pixels** (recommended)
2. Save as `public/og-image.png`
3. Update `src/config/branding.ts`:

```typescript
meta: {
  ogImage: '/og-image.png',
}
```

---

## Changing Brand Colors

### Method 1: Update Branding Config

Edit `src/config/branding.ts`:

```typescript
colors: {
  primary: '#0ea5e9',   // Your primary brand color (hex)
  accent: '#10b981',    // Your accent color
  secondary: '#8b5cf6', // Your secondary color
}
```

### Method 2: Update Tailwind Theme (for deeper customization)

Edit `src/index.css` to change CSS variables:

```css
:root {
  --primary: 221.2 83.2% 53.3%;        /* HSL values for primary */
  --accent: 142.1 76.2% 36.3%;         /* HSL values for accent */
  --secondary: 262.1 83.3% 57.8%;      /* HSL values for secondary */
}
```

**Converting Hex to HSL:**
- Use a tool like [HTMLcolorcodes.com](https://htmlcolorcodes.com/hex-to-hsl/)
- Remove the `hsl()` wrapper and keep only the numbers

---

## Testing Your Changes

After making branding changes:

1. **Restart the dev server** (if it's running):
   ```bash
   npm run dev
   ```

2. **Hard refresh the browser:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **Clear browser cache** if favicon doesn't update:
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files

---

## Production Deployment

After changing branding:

1. **Rebuild the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your production server

3. **Ensure all image assets** in `public/` are uploaded alongside the build

---

## Advanced: Dynamic Logo Upload (Admin Feature)

To allow admins to upload logos without code changes:

1. Create a `SiteSettings` table in the database
2. Store logo URLs in the settings
3. Fetch branding config from API on app load
4. Create an admin settings page to manage uploads

**Example Schema:**
```sql
CREATE TABLE SiteSettings (
  id INT PRIMARY KEY,
  logoUrl VARCHAR(255),
  logoIconUrl VARCHAR(255),
  faviconUrl VARCHAR(255),
  brandName VARCHAR(100),
  tagline VARCHAR(100),
  primaryColor VARCHAR(7),
  accentColor VARCHAR(7),
  updatedAt DATETIME
);
```

---

## Common Issues

### Favicon Not Updating
- **Solution**: Hard refresh (Ctrl+Shift+R), clear browser cache, or open in incognito mode
- Browsers aggressively cache favicons

### Logo Appears Blurry
- **Solution**: Use high-resolution images (2x or 3x the display size)
- For a 180px wide logo, provide a 360px or 540px source

### Logo Not Centered
- **Solution**: Ensure your image has transparent padding or adjust the CSS in `Header.tsx`

### Image Logo Not Showing
- **Solution**: Check that:
  - File exists in `public/` folder
  - Path in config matches exactly (case-sensitive)
  - `type` is set to `'image'` in branding config

---

## File Reference

| File | Purpose |
|------|---------|
| `src/config/branding.ts` | Central branding configuration |
| `src/components/Header.tsx` | Main logo rendering |
| `index.html` | HTML meta tags and favicon references |
| `public/favicon.ico` | Browser tab icon |
| `public/logo.png` | Main logo image (if using image-based logo) |
| `public/og-image.png` | Social media preview image |

---

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify file paths are correct (case-sensitive)
3. Ensure files are in `public/` folder, not `src/`
4. Restart the dev server after config changes

---

## Changelog

- **2025-11-11**: Initial branding system created with centralized configuration

