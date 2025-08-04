'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const subcategories = [
      // Security Systems - CCTV Cameras
      { name: 'dome-cameras', category: 'security', displayName: 'Dome Cameras', description: 'Dome-style CCTV cameras for indoor and outdoor surveillance', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'bullet-cameras', category: 'security', displayName: 'Bullet Cameras', description: 'Cylindrical CCTV cameras for outdoor surveillance', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'ptz-cameras', category: 'security', displayName: 'PTZ Cameras', description: 'Pan-Tilt-Zoom cameras with remote control capabilities', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'ip-cameras', category: 'security', displayName: 'IP Cameras', description: 'Network-based digital cameras for IP surveillance', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'analog-cameras', category: 'security', displayName: 'Analog Cameras', description: 'Traditional analog CCTV cameras', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'night-vision-cameras', category: 'security', displayName: 'Night Vision Cameras', description: 'CCTV cameras with infrared night vision capabilities', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'wireless-cameras', category: 'security', displayName: 'Wireless Cameras', description: 'Wireless CCTV cameras for easy installation', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: '4k-hd-cameras', category: 'security', displayName: '4K/HD Cameras', description: 'High-definition and 4K resolution CCTV cameras', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Security Systems - Biometric Access
      { name: 'fingerprint-scanners', category: 'security', displayName: 'Fingerprint Scanners', description: 'Biometric fingerprint recognition systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'face-recognition-systems', category: 'security', displayName: 'Face Recognition Systems', description: 'Advanced facial recognition access control', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'iris-scanners', category: 'security', displayName: 'Iris Scanners', description: 'High-security iris recognition systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'hand-geometry-readers', category: 'security', displayName: 'Hand Geometry Readers', description: 'Hand shape and size recognition systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'voice-recognition', category: 'security', displayName: 'Voice Recognition', description: 'Voice-based biometric access control', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'multi-factor-biometric-systems', category: 'security', displayName: 'Multi-factor Biometric Systems', description: 'Combined biometric authentication systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Security Systems - Intruder Alarms
      { name: 'motion-sensors', category: 'security', displayName: 'Motion Sensors', description: 'Motion detection sensors for security systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'door-window-sensors', category: 'security', displayName: 'Door/Window Sensors', description: 'Contact sensors for doors and windows', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'glass-break-detectors', category: 'security', displayName: 'Glass Break Detectors', description: 'Sensors that detect glass breaking', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'smoke-detectors', category: 'security', displayName: 'Smoke Detectors', description: 'Fire detection and alarm systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'carbon-monoxide-detectors', category: 'security', displayName: 'Carbon Monoxide Detectors', description: 'CO gas detection and alarm systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'control-panels', category: 'security', displayName: 'Control Panels', description: 'Central control systems for security alarms', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'sirens-strobes', category: 'security', displayName: 'Sirens & Strobes', description: 'Audible and visual alarm devices', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'wireless-alarm-systems', category: 'security', displayName: 'Wireless Alarm Systems', description: 'Wireless security alarm systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // ICT Equipment - Computers
      { name: 'desktop-computers', category: 'ict', displayName: 'Desktop Computers', description: 'Desktop and tower computer systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'laptops-notebooks', category: 'ict', displayName: 'Laptops & Notebooks', description: 'Portable laptop computers and notebooks', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'all-in-one-pcs', category: 'ict', displayName: 'All-in-One PCs', description: 'Integrated desktop computers with built-in displays', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'gaming-computers', category: 'ict', displayName: 'Gaming Computers', description: 'High-performance gaming desktop systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'workstations', category: 'ict', displayName: 'Workstations', description: 'Professional workstation computers', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'mini-pcs', category: 'ict', displayName: 'Mini PCs', description: 'Compact mini desktop computers', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'computer-accessories', category: 'ict', displayName: 'Computer Accessories', description: 'Computer peripherals and accessories', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // ICT Equipment - Networking Devices
      { name: 'routers', category: 'ict', displayName: 'Routers', description: 'Network routers for internet connectivity', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'switches', category: 'ict', displayName: 'Switches', description: 'Network switches for LAN connectivity', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'network-adapters', category: 'ict', displayName: 'Network Adapters', description: 'Network interface cards and adapters', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'network-cables', category: 'ict', displayName: 'Network Cables', description: 'Ethernet and network cabling', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'wireless-access-points', category: 'ict', displayName: 'Wireless Access Points', description: 'WiFi access points and extenders', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'network-security-devices', category: 'ict', displayName: 'Network Security Devices', description: 'Firewalls and network security equipment', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'modems', category: 'ict', displayName: 'Modems', description: 'Internet modems and gateways', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'network-storage', category: 'ict', displayName: 'Network Storage', description: 'NAS and network storage solutions', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // ICT Equipment - UPS and Batteries
      { name: 'online-ups', category: 'ict', displayName: 'Online UPS', description: 'Online uninterruptible power supplies', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'offline-ups', category: 'ict', displayName: 'Offline UPS', description: 'Offline uninterruptible power supplies', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'line-interactive-ups', category: 'ict', displayName: 'Line Interactive UPS', description: 'Line-interactive UPS systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'battery-backup-systems', category: 'ict', displayName: 'Battery Backup Systems', description: 'Battery backup power solutions', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'replacement-batteries', category: 'ict', displayName: 'Replacement Batteries', description: 'UPS replacement batteries', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'power-strips', category: 'ict', displayName: 'Power Strips', description: 'Power distribution strips and surge protectors', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'surge-protectors', category: 'ict', displayName: 'Surge Protectors', description: 'Electrical surge protection devices', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Electrical Materials - Wires & Cables
      { name: 'power-cables', category: 'electrical', displayName: 'Power Cables', description: 'Electrical power cables and wiring', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'data-cables', category: 'electrical', displayName: 'Data Cables', description: 'Data transmission cables', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'hdmi-cables', category: 'electrical', displayName: 'HDMI Cables', description: 'High-definition multimedia interface cables', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'usb-cables', category: 'electrical', displayName: 'USB Cables', description: 'Universal serial bus cables', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'ethernet-cables', category: 'electrical', displayName: 'Ethernet Cables', description: 'Network ethernet cables', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'coaxial-cables', category: 'electrical', displayName: 'Coaxial Cables', description: 'Coaxial cables for audio/video transmission', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'speaker-wires', category: 'electrical', displayName: 'Speaker Wires', description: 'Audio speaker wiring and cables', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'extension-cords', category: 'electrical', displayName: 'Extension Cords', description: 'Electrical extension cords and cables', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Electrical Materials - Switches & Sockets
      { name: 'light-switches', category: 'electrical', displayName: 'Light Switches', description: 'Electrical light switches and controls', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'power-outlets', category: 'electrical', displayName: 'Power Outlets', description: 'Electrical power outlets and sockets', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'usb-outlets', category: 'electrical', displayName: 'USB Outlets', description: 'Power outlets with USB charging ports', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'dimmer-switches', category: 'electrical', displayName: 'Dimmer Switches', description: 'Variable light dimmer switches', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'smart-switches', category: 'electrical', displayName: 'Smart Switches', description: 'Smart home electrical switches', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'industrial-sockets', category: 'electrical', displayName: 'Industrial Sockets', description: 'Heavy-duty industrial electrical sockets', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'weatherproof-outlets', category: 'electrical', displayName: 'Weatherproof Outlets', description: 'Outdoor weatherproof electrical outlets', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Electrical Materials - Circuit Breakers
      { name: 'main-circuit-breakers', category: 'electrical', displayName: 'Main Circuit Breakers', description: 'Main electrical circuit breakers', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'branch-circuit-breakers', category: 'electrical', displayName: 'Branch Circuit Breakers', description: 'Branch circuit protection breakers', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'ground-fault-circuit-interrupters', category: 'electrical', displayName: 'Ground Fault Circuit Interrupters', description: 'GFCI circuit protection devices', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'arc-fault-circuit-interrupters', category: 'electrical', displayName: 'Arc Fault Circuit Interrupters', description: 'AFCI circuit protection devices', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'miniature-circuit-breakers', category: 'electrical', displayName: 'Miniature Circuit Breakers', description: 'MCB circuit protection devices', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'industrial-circuit-breakers', category: 'electrical', displayName: 'Industrial Circuit Breakers', description: 'Heavy-duty industrial circuit breakers', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Power Solutions - Solar Panels
      { name: 'monocrystalline-panels', category: 'power', displayName: 'Monocrystalline Panels', description: 'High-efficiency monocrystalline solar panels', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'polycrystalline-panels', category: 'power', displayName: 'Polycrystalline Panels', description: 'Cost-effective polycrystalline solar panels', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'thin-film-panels', category: 'power', displayName: 'Thin-Film Panels', description: 'Flexible thin-film solar panels', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'solar-panel-mounting-systems', category: 'power', displayName: 'Solar Panel Mounting Systems', description: 'Mounting hardware for solar panels', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'solar-panel-accessories', category: 'power', displayName: 'Solar Panel Accessories', description: 'Solar panel accessories and components', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'portable-solar-panels', category: 'power', displayName: 'Portable Solar Panels', description: 'Portable and mobile solar panel systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Power Solutions - Inverters
      { name: 'grid-tie-inverters', category: 'power', displayName: 'Grid-Tie Inverters', description: 'Grid-connected solar inverters', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'off-grid-inverters', category: 'power', displayName: 'Off-Grid Inverters', description: 'Off-grid solar power inverters', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'hybrid-inverters', category: 'power', displayName: 'Hybrid Inverters', description: 'Hybrid solar and battery inverters', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'micro-inverters', category: 'power', displayName: 'Micro Inverters', description: 'Individual panel micro-inverters', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'string-inverters', category: 'power', displayName: 'String Inverters', description: 'String-based solar inverters', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'industrial-inverters', category: 'power', displayName: 'Industrial Inverters', description: 'Heavy-duty industrial power inverters', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Power Solutions - Batteries
      { name: 'deep-cycle-batteries', category: 'power', displayName: 'Deep Cycle Batteries', description: 'Deep cycle batteries for solar systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'lithium-ion-batteries', category: 'power', displayName: 'Lithium-Ion Batteries', description: 'High-performance lithium-ion batteries', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'lead-acid-batteries', category: 'power', displayName: 'Lead-Acid Batteries', description: 'Traditional lead-acid battery systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'agm-batteries', category: 'power', displayName: 'AGM Batteries', description: 'Absorbent glass mat batteries', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'gel-batteries', category: 'power', displayName: 'Gel Batteries', description: 'Gel cell battery systems', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'battery-chargers', category: 'power', displayName: 'Battery Chargers', description: 'Battery charging systems and controllers', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'battery-management-systems', category: 'power', displayName: 'Battery Management Systems', description: 'BMS systems for battery monitoring and control', isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ];

    try {
      await queryInterface.bulkInsert('Subcategories', subcategories, {});
      console.log('✅ Subcategories seeded successfully');
    } catch (error) {
      console.log('❌ Error seeding subcategories:', error.message);
      // Continue even if some subcategories already exist
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('Subcategories', null, {});
      console.log('✅ Subcategories removed successfully');
    } catch (error) {
      console.log('❌ Error removing subcategories:', error.message);
    }
  }
}; 