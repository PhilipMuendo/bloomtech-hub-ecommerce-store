import React from 'react';
import { Wrench } from 'lucide-react';
import { branding } from '@/config/branding';

const MaintenancePage = () => (
  <div className="min-h-screen flex items-center justify-center hero-gradient text-white px-4">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
        <Wrench className="w-7 h-7" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">We'll be back shortly</h1>
      <p className="text-white/80 leading-relaxed">
        {branding.company.fullName} is currently undergoing scheduled maintenance.
        Thanks for your patience — please check back soon.
      </p>
    </div>
  </div>
);

export default MaintenancePage;
