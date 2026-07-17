import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Clock, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setTicketId(data.messageId ? String(data.messageId) : null);
        toast({
          title: "Message Sent!",
          description: data.messageId
            ? `Thank you for contacting us — reference Ticket #${data.messageId} if you follow up. We'll get back to you soon!`
            : "Thank you for contacting us. We'll get back to you soon!",
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground text-lg">
          Get in touch with our team for any inquiries about our ICT equipment and electrical materials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Get In Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium">Call Us</p>
                  <p className="text-muted-foreground">0769 928 629</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium">Call/WhatsApp</p>
                  <p className="text-muted-foreground">0727 717 787</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium">Working Hours</p>
                  <p className="text-muted-foreground">Mon–Fri: 8:00 AM – 5:00 PM</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">info@bloomtechub.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-accent mt-1" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground">
                    P.O. BOX 14294–00800<br />
                    Kanha Building, Lower Kabete Road,<br />
                    Opposite Sarit Centre, 3rd Floor, Nairobi
                  </p>
                </div>
              </div>
              {/* Social Media Icons */}
              <div className="flex items-center space-x-4 pt-4">
                <a href="https://www.facebook.com/keensellventures/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="w-6 h-6 text-accent hover:text-blue-600 transition-colors" />
                </a>
                <a href="https://x.com/Keensell" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="w-6 h-6 text-accent hover:text-blue-400 transition-colors" />
                </a>
                <a href="https://www.instagram.com/keensellventures/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="w-6 h-6 text-accent hover:text-pink-500 transition-colors" />
                </a>
                <a href="https://ke.linkedin.com/company/keensell-ventures" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="w-6 h-6 text-accent hover:text-blue-700 transition-colors" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            {isSubmitted && ticketId && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Message sent — your reference is <strong>Ticket #{ticketId}</strong>. Quote this
                  if you follow up by phone or email.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Send className="mr-2 h-4 w-4 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
