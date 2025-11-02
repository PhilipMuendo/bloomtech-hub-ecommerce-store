import React from 'react';

const PrivacyPolicy = () => (
  <div className="container mx-auto px-4 py-8 max-w-3xl">
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <p className="mb-4">At BLOOMTECH Hub, we are committed to protecting your personal information.</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">What We Collect</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>Name, email address, and contact info</li>
      <li>Billing/shipping address</li>
      <li>Purchase history</li>
      <li>Device/browser data (via cookies)</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">Why We Collect</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>To process your orders and manage your account</li>
      <li>To improve your experience and support</li>
      <li>To send newsletters or updates (if opted in)</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">How We Protect Your Data</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>Encrypted storage</li>
      <li>Access restrictions</li>
      <li>Never sold or shared with third parties</li>
    </ul>
    <p className="mt-6">For any privacy-related inquiries, contact: <a href="mailto:support@bloomtechub.com" className="text-blue-600 underline">support@bloomtechub.com</a></p>
  </div>
);

export default PrivacyPolicy; 