import React from 'react';

const TermsOfService = () => (
  <div className="container mx-auto px-4 py-8 max-w-3xl">
    <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
    <p className="mb-4">By using our website, you agree to the following terms:</p>
    <ol className="list-decimal ml-6 mb-4">
      <li className="mb-2">
        <strong>Use of Platform</strong><br />
        You may browse, shop, and use our content for personal, non-commercial use only.
      </li>
      <li className="mb-2">
        <strong>Purchases</strong><br />
        All orders are subject to product availability and price confirmation. We reserve the right to cancel or refuse any order.
      </li>
      <li className="mb-2">
        <strong>Content</strong><br />
        All site content is owned by BLOOMTECH Hub and may not be copied without permission.
      </li>
      <li className="mb-2">
        <strong>Changes</strong><br />
        We may update terms at any time. Continued use of the site constitutes acceptance.
      </li>
    </ol>
    <p>If you have any questions about our terms, please contact us.</p>
  </div>
);

export default TermsOfService; 