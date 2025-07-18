import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AnimatedCounter from '@/components/AnimatedCounter';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Gradient/Abstract Background */}
      <div className="absolute inset-0 w-full h-96 bg-gradient-to-br from-primary/80 via-accent/60 to-white/80 pointer-events-none z-0" style={{ filter: 'blur(60px)', opacity: 0.5 }} />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-full flex justify-center mb-6">
              <img
                src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=1200"
                alt="Customer support agent smiling"
                className="w-full max-w-3xl h-64 object-cover rounded-xl shadow-lg border-4 border-white/80"
                style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
              />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-primary drop-shadow-lg">About BLOOMTECH Hub</h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Your trusted partner for security systems, ICT equipment, electrical materials, and power solutions across Kenya
            </p>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800"
                alt="Technology workspace"
                className="w-full max-w-md h-72 object-cover rounded-2xl shadow-2xl border-4 border-accent/30"
              />
            </div>
            <div className="space-y-6">
              <Card className="bg-primary/5 shadow-md">
                <CardContent className="p-6 flex items-start gap-4">
                  <span className="text-3xl lg:text-4xl text-primary"><svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-10 h-10'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-2.21 0-4 1.79-4 4v5h8v-5c0-2.21-1.79-4-4-4z' /></svg></span>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Our Story</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Founded with a vision to bridge the technology gap in Kenya, BLOOMTECH Hub has grown 
                      to become a leading supplier of quality security systems, ICT equipment, electrical materials, 
                      and power solutions. We understand the unique challenges faced by businesses, professionals, 
                      and individuals in accessing reliable technology solutions.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-accent/10 shadow-md">
                <CardContent className="p-6 flex items-start gap-4">
                  <span className="text-3xl lg:text-4xl text-accent"><svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-10 h-10'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z' /></svg></span>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      To provide accessible, high-quality technology solutions that empower businesses 
                      and individuals to achieve their goals. We are committed to excellence in product 
                      quality, customer service, and technical support.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quality Assurance */}
              <motion.div whileHover={{ scale: 1.05, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.12)' }}>
                <Card className="text-center bg-gradient-to-br from-primary/10 to-white hover:from-primary/20 transition-all duration-300 shadow-md">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="w-9 h-9 text-white animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m0 0c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2z" /></svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
                    <p className="text-muted-foreground">
                      Every product we sell meets stringent quality standards and comes with 
                      manufacturer warranties.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              {/* Customer First */}
              <motion.div whileHover={{ scale: 1.05, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.12)' }}>
                <Card className="text-center bg-gradient-to-br from-accent/10 to-white hover:from-accent/20 transition-all duration-300 shadow-md">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="w-9 h-9 text-white animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m0 0c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2z" /></svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Customer First</h3>
                    <p className="text-muted-foreground">
                      Our customers are at the heart of everything we do. We provide personalized 
                      service and technical support.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              {/* Innovation */}
              <motion.div whileHover={{ scale: 1.05, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.12)' }}>
                <Card className="text-center bg-gradient-to-br from-primary/10 to-accent/5 hover:from-primary/20 transition-all duration-300 shadow-md">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="w-9 h-9 text-white animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                    <p className="text-muted-foreground">
                      We stay ahead of technology trends to bring you the latest and most 
                      efficient solutions.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Section (Animated Counters) */}
          <motion.div
            className="py-16 bg-gradient-to-r from-primary/10 via-accent/10 to-white rounded-2xl mb-12 shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <span className="mb-2 text-3xl text-primary"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12V4" /></svg></span>
                <AnimatedCounter value={1000} label="Happy Customers" />
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-2 text-3xl text-accent"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4" /></svg></span>
                <AnimatedCounter value={500} label="Products Sold" />
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-2 text-3xl text-primary"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5" /><circle cx="12" cy="7" r="4" /></svg></span>
                <AnimatedCounter value={47} label="Serving Cities" />
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-2 text-3xl text-accent"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-3-3.87" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 21v-2a4 4 0 013-3.87" /><circle cx="12" cy="7" r="4" /></svg></span>
                <AnimatedCounter value={100} label="Trusted by Businesses" />
              </div>
            </div>
          </motion.div>

          {/* What We Offer */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold text-center mb-8">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Security Systems */}
              <motion.div whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)' }}>
                <Card className="hover:border-primary border-2 border-transparent transition-all duration-300 shadow-md">
                  <CardContent className="p-6 flex flex-col items-center">
                    <span className="mb-3 text-3xl text-primary"><svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M16 3v4M8 3v4" /></svg></span>
                    <h3 className="text-xl font-semibold mb-4 text-primary">Security Systems</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• CCTV cameras and surveillance equipment</li>
                      <li>• Access control and door locks</li>
                      <li>• Alarm systems and sensors</li>
                      <li>• Intercom and video doorbells</li>
                      <li>• Security monitoring solutions</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
              {/* ICT Equipment */}
              <motion.div whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)' }}>
                <Card className="hover:border-accent border-2 border-transparent transition-all duration-300 shadow-md">
                  <CardContent className="p-6 flex flex-col items-center">
                    <span className="mb-3 text-3xl text-accent"><svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="13" rx="2" /><path d="M16 3v4M8 3v4" /></svg></span>
                    <h3 className="text-xl font-semibold mb-4 text-primary">ICT Equipment</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Latest laptops and desktop computers</li>
                      <li>• Networking equipment and accessories</li>
                      <li>• High-quality cables and connectors</li>
                      <li>• Computer peripherals and accessories</li>
                      <li>• Storage solutions and backup devices</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
              {/* Electrical Materials */}
              <motion.div whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)' }}>
                <Card className="hover:border-accent border-2 border-transparent transition-all duration-300 shadow-md">
                  <CardContent className="p-6 flex flex-col items-center">
                    <span className="mb-3 text-3xl text-accent"><svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="13" rx="2" /><path d="M16 3v4M8 3v4" /></svg></span>
                    <h3 className="text-xl font-semibold mb-4 text-accent">Electrical Materials</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Circuit breakers and electrical panels</li>
                      <li>• Power cables and extension cords</li>
                      <li>• Switches, sockets, and outlets</li>
                      <li>• Professional electrical tools</li>
                      <li>• Safety equipment and accessories</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
              {/* Power Solutions */}
              <motion.div whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)' }}>
                <Card className="hover:border-primary border-2 border-transparent transition-all duration-300 shadow-md">
                  <CardContent className="p-6 flex flex-col items-center">
                    <span className="mb-3 text-3xl text-primary"><svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="13" rx="2" /><path d="M16 3v4M8 3v4" /></svg></span>
                    <h3 className="text-xl font-semibold mb-4 text-accent">Power Solutions</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• UPS and backup power systems</li>
                      <li>• Solar inverters and controllers</li>
                      <li>• Portable generators and equipment</li>
                      <li>• Battery chargers and accessories</li>
                      <li>• Power management solutions</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            className="rounded-2xl bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground text-center shadow-xl mt-16 mb-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="p-10 sm:p-14">
              <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">Ready to Get Started?</h2>
              <p className="mb-8 opacity-90 text-lg max-w-2xl mx-auto">
                Contact us today to discuss your technology and electrical needs.<br />
                Our expert team is ready to help you find the perfect solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to="/contact"
                  className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg shadow-md hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
