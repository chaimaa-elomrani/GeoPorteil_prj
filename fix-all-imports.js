const fs = require('fs');
const path = require('path');

// Function to fix all import issues
function fixAllImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Fix UI component imports based on folder location
    const uiImportFixes = [
      { old: /from\s+['"]\.\/ui\//g, new: 'from "../ui/' },
      { old: /from\s+['"]\.\.\/ui\//g, new: 'from "../ui/' },
      { old: /from\s+['"]\.\.\/\.\.\/ui\//g, new: 'from "../ui/' }
    ];
    
    // Fix service imports based on folder depth
    const serviceImportFixes = [
      { old: /from\s+['"]\.\/services\/api['"]/, new: 'from "../../services/api"' },
      { old: /from\s+['"]\.\.\/services\/api['"]/, new: 'from "../../services/api"' },
      { old: /from\s+['"]\.\.\/\.\.\/services\/api['"]/, new: 'from "../../services/api"' }
    ];
    
    // Fix context imports
    const contextImportFixes = [
      { old: /from\s+['"]\.\/contexts\//, new: 'from "../../contexts/' },
      { old: /from\s+['"]\.\.\/contexts\//, new: 'from "../../contexts/' },
      { old: /from\s+['"]\.\.\/\.\.\/contexts\//, new: 'from "../../contexts/' }
    ];
    
    // Apply UI fixes
    if (filePath.includes('/components/')) {
      uiImportFixes.forEach(fix => {
        if (content.match(fix.old)) {
          content = content.replace(fix.old, fix.new);
          updated = true;
        }
      });
      
      serviceImportFixes.forEach(fix => {
        if (content.match(fix.old)) {
          content = content.replace(fix.old, fix.new);
          updated = true;
        }
      });
      
      contextImportFixes.forEach(fix => {
        if (content.match(fix.old)) {
          content = content.replace(fix.old, fix.new);
          updated = true;
        }
      });
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed imports in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find all JS/JSX files
function findJSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findJSFiles(fullPath, files);
    } else if (item.match(/\.(js|jsx|ts|tsx)$/)) {
      files.push(fullPath);
    }
  });
  
  return files;
}

// Main execution
console.log('🔧 Fixing all remaining import issues...\n');

const directories = [
  './frontend/src/components'
];

let totalFixed = 0;

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Scanning ${dir}...`);
    const files = findJSFiles(dir);
    
    files.forEach(file => {
      if (fixAllImports(file)) {
        totalFixed++;
      }
    });
  }
});

console.log(`\n🎉 Import fix completed!`);
console.log(`📊 Fixed ${totalFixed} files`);

// Clean up this script
setTimeout(() => {
  try {
    fs.unlinkSync('./fix-all-imports.js');
    console.log('🧹 Cleaned up fix script');
  } catch (error) {
    // Ignore cleanup errors
  }
}, 1000);
