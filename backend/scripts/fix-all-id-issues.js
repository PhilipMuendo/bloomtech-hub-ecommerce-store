// Usage: node scripts/fix-all-id-issues.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixAllIdIssues() {
  try {
    console.log('🔧 Comprehensive ID Issue Fix\n');
    
    const frontendDir = path.join(__dirname, '../../src');
    
    // Common patterns that might cause issues with integer IDs
    const patterns = [
      {
        name: 'ID slice operations',
        pattern: /\.id\?\.slice\(/g,
        replacement: '.id?.toString().slice(',
        description: 'Converting integer IDs to strings before slice operations'
      },
      {
        name: 'ID toLowerCase operations',
        pattern: /\.id\.toLowerCase\(\)/g,
        replacement: '.id?.toString().toLowerCase()',
        description: 'Converting integer IDs to strings before toLowerCase operations'
      },
      {
        name: 'ID includes operations',
        pattern: /\.id\.includes\(/g,
        replacement: '.id?.toString().includes(',
        description: 'Converting integer IDs to strings before includes operations'
      },
      {
        name: 'ID startsWith operations',
        pattern: /\.id\.startsWith\(/g,
        replacement: '.id?.toString().startsWith(',
        description: 'Converting integer IDs to strings before startsWith operations'
      },
      {
        name: 'ID endsWith operations',
        pattern: /\.id\.endsWith\(/g,
        replacement: '.id?.toString().endsWith(',
        description: 'Converting integer IDs to strings before endsWith operations'
      },
      {
        name: 'ID replace operations',
        pattern: /\.id\.replace\(/g,
        replacement: '.id?.toString().replace(',
        description: 'Converting integer IDs to strings before replace operations'
      },
      {
        name: 'ID split operations',
        pattern: /\.id\.split\(/g,
        replacement: '.id?.toString().split(',
        description: 'Converting integer IDs to strings before split operations'
      },
      {
        name: 'ID trim operations',
        pattern: /\.id\.trim\(\)/g,
        replacement: '.id?.toString().trim()',
        description: 'Converting integer IDs to strings before trim operations'
      }
    ];
    
    // Files to check
    const filesToCheck = [
      'src/pages/admin/Dashboard.tsx',
      'src/pages/admin/AdminOrders.tsx',
      'src/pages/admin/Products.tsx',
      'src/pages/admin/Users.tsx',
      'src/pages/admin/Reviews.tsx',
      'src/pages/admin/Quotes.tsx',
      'src/pages/Orders.tsx',
      'src/pages/CustomCheckout.tsx',
      'src/pages/ProductDetail.tsx',
      'src/pages/Shop.tsx',
      'src/components/Header.tsx',
      'src/components/AdminLayout.tsx',
      'src/hooks/useWishlist.ts',
      'src/context/AuthContext.tsx'
    ];
    
    let totalIssuesFound = 0;
    let totalIssuesFixed = 0;
    
    for (const filePath of filesToCheck) {
      const fullPath = path.join(__dirname, '../..', filePath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ File not found: ${filePath}`);
        continue;
      }
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let fileIssuesFound = 0;
      let fileIssuesFixed = 0;
      
      console.log(`\n📋 Checking: ${filePath}`);
      
      for (const pattern of patterns) {
        const matches = content.match(pattern.pattern);
        if (matches) {
          console.log(`   - Found ${matches.length} ${pattern.name} issues`);
          fileIssuesFound += matches.length;
          
          // Apply the fix
          const newContent = content.replace(pattern.pattern, pattern.replacement);
          if (newContent !== content) {
            content = newContent;
            fileIssuesFixed += matches.length;
            console.log(`   - Fixed ${matches.length} ${pattern.name} issues`);
          }
        }
      }
      
      if (fileIssuesFound > 0) {
        // Write the fixed content back to the file
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`   ✅ Updated file with ${fileIssuesFixed} fixes`);
      } else {
        console.log(`   ✅ No issues found`);
      }
      
      totalIssuesFound += fileIssuesFound;
      totalIssuesFixed += fileIssuesFixed;
    }
    
    console.log('\n📊 Summary:');
    console.log(`- Files checked: ${filesToCheck.length}`);
    console.log(`- Total issues found: ${totalIssuesFound}`);
    console.log(`- Total issues fixed: ${totalIssuesFixed}`);
    
    if (totalIssuesFixed > 0) {
      console.log('\n🎉 All ID-related issues have been fixed!');
      console.log('\n📋 Next steps:');
      console.log('1. Refresh your browser');
      console.log('2. Clear browser cache (Ctrl+F5)');
      console.log('3. Test all admin pages');
      console.log('4. Verify no more "is not a function" errors');
    } else {
      console.log('\n✅ No ID-related issues were found!');
    }
    
  } catch (error) {
    console.error('❌ ID issue fix failed:', error);
  }
}

fixAllIdIssues(); 