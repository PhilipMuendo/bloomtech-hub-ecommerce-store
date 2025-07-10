// Centralized product categories for consistent use across the platform

export interface Category {
  value: string;
  display: string;
  description: string;
  image: string; // path to image asset
}

import securitySystemsImg from '@/assets/security-systems.jpg';
import ictEquipmentImg from '@/assets/ict-equipment.jpg';
import electricalMaterialsImg from '@/assets/electrical-materials.jpg';
import powerSolutionsImg from '@/assets/power-solutions.jpg';

export const categories: Category[] = [
  {
    value: 'security',
    display: 'Security Systems',
    description: 'CCTV cameras, alarms, and access control systems',
    image: securitySystemsImg,
  },
  {
    value: 'ict',
    display: 'ICT Equipment',
    description: 'Laptops, computers, networking gear and accessories',
    image: ictEquipmentImg,
  },
  {
    value: 'electrical',
    display: 'Electrical Materials',
    description: 'Cables, circuit breakers, switches and electrical components',
    image: electricalMaterialsImg,
  },
  {
    value: 'power',
    display: 'Power Solutions',
    description: 'UPS systems, generators, and power backup solutions',
    image: powerSolutionsImg,
  },
];

// Helper for quick value-to-display mapping
export const categoryDisplayMap = Object.fromEntries(categories.map(cat => [cat.value, cat.display])); 