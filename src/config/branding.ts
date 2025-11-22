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
    // Text-based logo (current setup)
    type: 'text' as 'text' | 'image',
    
    // For text-based logos
    text: {
      initials: 'BT',
      gradientFrom: 'from-primary', // Tailwind class
      gradientTo: 'to-accent',      // Tailwind class
    },
    
    // For image-based logos (set type to 'image' to use these)
    image: {
      // Light mode logo
      src: '/logo.png',
      alt: 'BLOOMTECH Hub Logo',
      width: 180,
      height: 40,
      
      // Dark mode logo (optional, falls back to light if not provided)
      darkSrc: '/logo-dark.png',
      
      // Small/icon version for mobile/compact views
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

  // Colors (for programmatic use)
  colors: {
    primary: '#0ea5e9',   // Sky blue
    accent: '#10b981',    // Green
    secondary: '#8b5cf6', // Purple
  },
};

// Helper to get the logo based on current configuration
export const getLogo = () => branding.logo;

// Helper to determine if using image or text logo
export const isImageLogo = () => branding.logo.type === 'image';

