// Centralized product categories for consistent use across the platform

export interface Category {
  value: string;
  display: string;
  description: string;
  image: string; // path to image asset
}

export interface Subcategory {
  id: number;
  name: string;
  category: string;
  displayName: string;
  description: string;
  isActive: boolean;
}

import securitySystemsImg from '@/assets/house-security-system.jpg';
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

// Cache for subcategories to avoid repeated API calls
let subcategoriesCache: Record<string, Subcategory[]> = {};
let subcategoriesCacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch subcategories from backend API
export const fetchSubcategories = async (): Promise<Record<string, Subcategory[]>> => {
  const now = Date.now();
  
  // Return cached data if still valid
  if (subcategoriesCache && now < subcategoriesCacheExpiry) {
    return subcategoriesCache;
  }

  try {
    const response = await fetch('/api/subcategories');
    if (!response.ok) {
      throw new Error('Failed to fetch subcategories');
    }
    
    const data = await response.json();
    const subcategories = data.data || [];
    
    // Group subcategories by category
    const groupedSubcategories: Record<string, Subcategory[]> = {};
    subcategories.forEach((subcategory: Subcategory) => {
      if (!groupedSubcategories[subcategory.category]) {
        groupedSubcategories[subcategory.category] = [];
      }
      groupedSubcategories[subcategory.category].push(subcategory);
    });
    
    // Update cache
    subcategoriesCache = groupedSubcategories;
    subcategoriesCacheExpiry = now + CACHE_DURATION;
    
    return groupedSubcategories;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    // Return empty object if API fails
    return {};
  }
};

// Helper functions
export const getSubcategoriesByCategory = async (category: string): Promise<Subcategory[]> => {
  const subcategories = await fetchSubcategories();
  return subcategories[category] || [];
};

export const getSubcategoryByName = async (category: string, subcategoryName: string): Promise<Subcategory | undefined> => {
  const subcategories = await fetchSubcategories();
  return subcategories[category]?.find(sub => sub.name === subcategoryName);
};

export const getAllSubcategories = async (): Promise<Subcategory[]> => {
  const subcategories = await fetchSubcategories();
  return Object.values(subcategories).flat();
};

// Clear cache function for manual refresh
export const clearSubcategoriesCache = () => {
  subcategoriesCache = {};
  subcategoriesCacheExpiry = 0;
}; 