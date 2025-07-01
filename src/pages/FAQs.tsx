
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FAQs = () => {
  const faqs = [
    {
      question: "Do you offer delivery across Kenya?",
      answer: "Yes, we deliver countrywide via reliable courier services. Delivery timelines vary by location."
    },
    {
      question: "Can I pay on delivery?",
      answer: "Currently, all payments are made securely online before delivery."
    },
    {
      question: "Do products come with a warranty?",
      answer: "Most items come with manufacturer warranties. Check each product page for specific details."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can call, WhatsApp, email, or visit us using the contact information in the footer."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept M-Pesa, bank transfers, and major credit/debit cards for secure online payments."
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery within Nairobi takes 1-2 business days, while upcountry deliveries take 2-5 business days depending on location."
    },
    {
      question: "Can I return or exchange products?",
      answer: "Yes, we have a 30-day return policy for unused items in original packaging. Contact us to initiate a return."
    },
    {
      question: "Do you offer bulk discounts?",
      answer: "Yes, we provide competitive pricing for bulk orders. Contact our sales team for a custom quote."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg">
          Find answers to common questions about our products, services, and policies.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 bg-muted rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
        <p className="text-muted-foreground mb-4">
          Can't find the answer you're looking for? Our customer support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Call:</span>
            <span>0769 928 629</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">WhatsApp:</span>
            <span>0727 717 787</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Email:</span>
            <span>info@keensellventures.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
