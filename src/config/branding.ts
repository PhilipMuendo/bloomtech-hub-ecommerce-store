/**
 * Centralized branding configuration for BloomTech Hub
 * 
 * To customize your branding:
 * 1. Update the values below
 * 2. For logo images, upload them to /public/ or use external URLs
 * 3. For favicon, replace /public/favicon.ico with your own
 */

export const branding = {
  // Company/Brand Name
  company: {
    name: 'BLOOMTECH',
    tagline: 'Hub',
    fullName: 'BLOOMTECH Hub',
  },

  // Logo Configuration
  logo: {
    // Discriminates Header/Footer render branch: 'text' shows the icon mark
    // + companyName/companyTagline text side-by-side; 'image' shows only the
    // full stacked lockup below. Not literally text-vs-image — both branches
    // render a real logo image, just laid out differently.
    type: 'text' as 'text' | 'image',

    // For image-based logos (set type to 'image' to use these)
    image: {
      // Full stacked lockup (mark + wordmark) — used for OG image / large placements.
      src: '/logo.png',
      alt: 'Bloom Tech Hub Logo',
      width: 180,
      height: 40,

      // Square flower mark — used in the header next to the text wordmark.
      iconSrc: '/logo-icon.png',
      iconWidth: 40,
      iconHeight: 40,
    },
  },

  // Favicon
  favicon: {
    // Place your favicon.ico in /public/favicon.ico
    // For multiple sizes/formats, also add:
    // - /public/favicon-16x16.png
    // - /public/favicon-32x32.png
    // - /public/apple-touch-icon.png (180x180)
    path: '/favicon.ico',
  },

  // Social/SEO
  meta: {
    description: 'Premium ICT equipment and electrical materials supplier in Kenya. Quality laptops, networking gear, circuit breakers, cables and more.',
    keywords: 'ICT equipment Kenya, electrical materials, laptops, networking, circuit breakers, cables, Nairobi',
    author: 'BLOOMTECH Hub',
    twitterHandle: '@bloomtechhub',
    ogImage: '/og-image.png', // Place in /public/
  },

  // Colors (for programmatic use) — must match the tokens in src/index.css
  colors: {
    primary: '#0d6fce',   // Brand blue (logo gradient deep end)
    accent: '#0a86b9',    // Brand cyan (deepened for contrast)
  },
};

// Helper to get the logo based on current configuration
export const getLogo = () => branding.logo;

// Helper to determine if using image or text logo
export const isImageLogo = () => branding.logo.type === 'image';

