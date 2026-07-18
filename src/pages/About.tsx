import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Target,
  Award,
  Users,
  Sparkles,
  Camera,
  Cpu,
  Zap,
  BatteryCharging,
  ArrowRight,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

const values = [
  {
    icon: Award,
    title: 'Quality Assurance',
    description:
      'Every product we sell meets stringent quality standards and comes with manufacturer warranties.',
  },
  {
    icon: Users,
    title: 'Customer First',
    description:
      'Our customers are at the heart of everything we do — personalized service and responsive technical support.',
  },
  {
    icon: Sparkles,
    title: 'Innovation',
    description:
      'We stay ahead of technology trends to bring you the latest and most efficient solutions.',
  },
];

const offerings = [
  {
    icon: Camera,
    title: 'Security Systems',
    items: [
      'CCTV cameras and surveillance equipment',
      'Access control and door locks',
      'Alarm systems and sensors',
      'Intercom and video doorbells',
      'Security monitoring solutions',
    ],
  },
  {
    icon: Cpu,
    title: 'ICT Equipment',
    items: [
      'Laptops and desktop computers',
      'Networking equipment and accessories',
      'High-quality cables and connectors',
      'Computer peripherals and accessories',
      'Storage and backup solutions',
    ],
  },
  {
    icon: Zap,
    title: 'Electrical Materials',
    items: [
      'Circuit breakers and electrical panels',
      'Power cables and extension cords',
      'Switches, sockets, and outlets',
      'Professional electrical tools',
      'Safety equipment and accessories',
    ],
  },
  {
    icon: BatteryCharging,
    title: 'Power Solutions',
    items: [
      'UPS and backup power systems',
      'Solar inverters and controllers',
      'Portable generators and equipment',
      'Battery chargers and accessories',
      'Power management solutions',
    ],
  },
];

const About = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="hero-gradient text-white">
        <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              About BLOOMTECH Hub
            </span>
            <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance">
              Kenya's trusted partner for security, ICT, electrical &amp; power solutions
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl">
              We help businesses and individuals across Kenya access reliable,
              high-quality technology — backed by genuine expertise and support
              that doesn't disappear after the sale.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Story & Mission */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 -mt-10 sm:-mt-12 relative z-10"
            {...fadeUp}
          >
            <Card className="shadow-lg border-border/60">
              <CardContent className="p-6 sm:p-8">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-h3 mb-3">Our Story</h2>
                <p className="text-body text-muted-foreground">
                  Founded to bridge Kenya's technology gap, BLOOMTECH Hub has grown
                  into a trusted supplier of security systems, ICT equipment,
                  electrical materials, and power solutions — built around the
                  real challenges businesses and individuals face in accessing
                  dependable technology.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-border/60">
              <CardContent className="p-6 sm:p-8">
                <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-h3 mb-3">Our Mission</h2>
                <p className="text-body text-muted-foreground">
                  To provide accessible, high-quality technology solutions that
                  empower businesses and individuals to achieve their goals — with
                  a firm commitment to product quality, honest service, and
                  technical support that actually helps.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Values */}
          <motion.section className="mt-20 sm:mt-24" {...fadeUp}>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-h1">What We Stand For</h2>
              <p className="mt-3 text-lead">
                The principles that shape every product we stock and every order we fulfill.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {values.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="card-hover border-border/60">
                  <CardContent className="p-6 sm:p-7">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-h4 mb-2">{title}</h3>
                    <p className="text-body text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* What We Offer */}
          <motion.section className="mt-20 sm:mt-24" {...fadeUp}>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-h1">What We Offer</h2>
              <p className="mt-3 text-lead">
                Four product categories, one standard of quality.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {offerings.map(({ icon: Icon, title, items }) => (
                <Card key={title} className="card-hover border-border/60">
                  <CardContent className="p-6 sm:p-7">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="text-h4">{title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-body text-muted-foreground">
                          <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Contact CTA */}
          <motion.section className="my-20 sm:my-24" {...fadeUp}>
            <div className="hero-gradient rounded-2xl text-center shadow-xl px-6 py-12 sm:px-14 sm:py-16">
              <h2 className="text-h1 text-white mb-4">Ready to Get Started?</h2>
              <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-8">
                Contact us today to discuss your technology and electrical needs.
                Our team is ready to help you find the right solution.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-primary px-7 py-3.5 rounded-lg font-semibold shadow-md hover:bg-white/90 transition-colors"
              >
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default About;
