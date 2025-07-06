import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AnimatedCounter from '@/components/AnimatedCounter';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6">About BLOOMTECH Hub</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Your trusted partner for premium ICT equipment and electrical materials across Kenya
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <img
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800"
              alt="Technology workspace"
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                Founded with a vision to bridge the technology gap in Kenya, BLOOMTECH Hub has grown 
                to become a leading supplier of quality ICT equipment and electrical materials. We 
                understand the unique challenges faced by businesses, professionals, and individuals 
                in accessing reliable technology solutions.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To provide accessible, high-quality technology solutions that empower businesses 
                and individuals to achieve their goals. We are committed to excellence in product 
                quality, customer service, and technical support.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">🛡️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
                <p className="text-muted-foreground">
                  Every product we sell meets stringent quality standards and comes with 
                  manufacturer warranties.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">🤝</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Customer First</h3>
                <p className="text-muted-foreground">
                  Our customers are at the heart of everything we do. We provide personalized 
                  service and technical support.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                <p className="text-muted-foreground">
                  We stay ahead of technology trends to bring you the latest and most 
                  efficient solutions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section (Animated Counters) */}
        <div className="py-16 bg-muted rounded-lg mb-12">
          <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <AnimatedCounter value={1000} label="Happy Customers" />
            <AnimatedCounter value={500} label="Products Sold" />
            <AnimatedCounter value={50} label="Serving Cities" />
            <AnimatedCounter value={120} label="Trusted by Businesses" />
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">ICT Equipment</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Latest laptops and desktop computers</li>
                  <li>• Networking equipment and accessories</li>
                  <li>• High-quality cables and connectors</li>
                  <li>• Computer peripherals and accessories</li>
                  <li>• Storage solutions and backup devices</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-accent">Electrical Materials</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Circuit breakers and electrical panels</li>
                  <li>• Power cables and extension cords</li>
                  <li>• Switches, sockets, and outlets</li>
                  <li>• Professional electrical tools</li>
                  <li>• Safety equipment and accessories</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact CTA */}
        <Card className="bg-primary text-primary-foreground text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="mb-6 opacity-90">
              Contact us today to discuss your technology and electrical needs. 
              Our expert team is ready to help you find the perfect solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@keensellventures.com"
                className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Email Us
              </a>
              <a
                href="tel:+254700123456"
                className="border-2 border-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-primary transition-colors"
              >
                Call Us
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
