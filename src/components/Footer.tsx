
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Clock, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { categories } from '@/data/categories';
import { branding, isImageLogo } from '@/config/branding';
import { useSettings } from '@/context/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();

  // Merge settings with fallback branding
  const logoType = settings?.logoType || branding.logo.type;
  const logoIconSrc = settings?.logoIconSrc || settings?.logoImageSrc || branding.logo.image.iconSrc;
  const companyFullName = settings?.companyFullName || branding.company.fullName;
  const initials = settings?.logoTextInitials || branding.logo.text.initials;
  
  // Social media links (use settings if available, fall back to hardcoded)
  const facebookUrl = settings?.facebookUrl || 'https://www.facebook.com/keensellventures/';
  const twitterUrl = settings?.twitterUrl || 'https://x.com/Keensell';
  const instagramUrl = settings?.instagramUrl || 'https://www.instagram.com/keensellventures/?hl=en';
  const linkedinUrl = settings?.linkedinUrl || 'https://ke.linkedin.com/company/keensell-ventures';
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {logoType === 'image' ? (
                <img
                  src={logoIconSrc}
                  alt={branding.logo.image.alt}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <>
                  <div className={`w-8 h-8 bg-gradient-to-br ${branding.logo.text.gradientFrom} ${branding.logo.text.gradientTo} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-bold">{initials}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{companyFullName}</h3>
                  </div>
                </>
              )}
            </div>
            <p className="text-sm opacity-80">
              Your trusted supplier of quality ICT equipment and electrical materials. 
              We provide reliable solutions for all your technology and electrical needs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">
                About Us
              </Link>
              <Link to="/shop" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">
                Shop
              </Link>
              
              <Link to="/contact" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">
                Contact
              </Link>
              <Link to="/faqs" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">
                FAQs
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <div className="space-y-2">
              {categories.map(cat => (
                <Link key={cat.value} to={`/shop?category=${cat.value}`} className="block text-sm opacity-80 hover:opacity-100 transition-opacity">
                  {cat.display}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-sm opacity-80">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>0769 928 629</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>0727 717 787 (WhatsApp)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Mon–Fri: 8:00 AM – 5:00 PM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@bloomtechub.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <div>
                  <p>P.O. BOX 14294–00800</p>
                  <p>Kanha Building, Lower Kabete Road,</p>
                  <p>Opposite Sarit Centre, 3rd Floor, Nairobi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()} {companyFullName}. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
              Terms of Service
            </Link>
            <Link to="/returns-refunds" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
              Returns & Refunds
            </Link>
          </div>
          {/* Social Media Icons */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="w-6 h-6 text-accent hover:text-blue-600 transition-colors" />
              </a>
            )}
            {twitterUrl && (
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="w-6 h-6 text-accent hover:text-blue-400 transition-colors" />
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="w-6 h-6 text-accent hover:text-pink-500 transition-colors" />
              </a>
            )}
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="w-6 h-6 text-accent hover:text-blue-700 transition-colors" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
