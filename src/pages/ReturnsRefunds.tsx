import React from 'react';

const ReturnsRefunds = () => (
  <div className="container mx-auto px-4 py-8 max-w-3xl">
    <h1 className="text-3xl font-bold mb-6">Returns &amp; Refunds</h1>
    <p className="mb-4">We aim for 100% customer satisfaction. If you’re not happy with your purchase:</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">Return Window</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>Returns accepted within 7 days of delivery</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">Eligibility</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>Item must be unused and in original packaging</li>
      <li>Include receipt or proof of purchase</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">Refunds</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>Once we receive and inspect your return, we’ll notify you about the approval</li>
      <li>Approved refunds are processed within 5–7 business days</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">Non-Returnable Items</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>Clearance items, opened software, or custom orders</li>
    </ul>
    <p className="mt-6">To initiate a return, contact: <a href="mailto:returns@bloomtechub.com" className="text-blue-600 underline">returns@bloomtechub.com</a></p>
  </div>
);

export default ReturnsRefunds; 