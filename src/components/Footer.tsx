
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">BT</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">BLOOMTECH Hub</h3>
              </div>
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
              <Link to="/shop?category=ict" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">
                ICT Equipment
              </Link>
              <Link to="/shop?category=electrical" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">
                Electrical Materials
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-sm opacity-80">
              <p>Email: info@bloomtechhub.com</p>
              <p>Phone: +254 700 123 456</p>
              <p>Address: Nairobi, Kenya</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm opacity-80">
            © 2024 BLOOMTECH Hub. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
              Terms of Service
            </Link>
            <Link to="/returns" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
              Returns & Refunds
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
