const fs = require('fs');
const path = require('path');

// Function to fix service imports based on folder depth
function fixServiceImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Determine the correct relative path based on folder structure
    const relativePath = path.relative(path.dirname(filePath), 'frontend/src');
    const depth = relativePath.split(path.sep).length - 1;
    
    // Calculate correct path to services
    let correctPath;
    if (filePath.includes('components/dashboard/') || 
        filePath.includes('components/layout/') ||
        filePath.includes('components/projects/') ||
        filePath.includes('components/maps/') ||
        filePath.includes('components/users/') ||
        filePath.includes('components/modals/') ||
        filePath.includes('components/security/') ||
        filePath.includes('components/common/')) {
      correctPath = '../../services/api';
    } else if (filePath.includes('components/auth/') ||
               filePath.includes('components/ui/')) {
      correctPath = '../../services/api';
    } else if (filePath.includes('components/')) {
      correctPath = '../services/api';
    } else {
      correctPath = './services/api';
    }
    
    // Fix various service import patterns
    const patterns = [
      { old: /from\s+["']\.\.\/services\/api["']/g, new: `from "${correctPath}"` },
      { old: /from\s+["']\.\/services\/api["']/g, new: `from "${correctPath}"` },
      { old: /from\s+["']\.\.\/\.\.\/services\/api["']/g, new: `from "${correctPath}"` },
      { old: /from\s+["']services\/api["']/g, new: `from "${correctPath}"` }
    ];
    
    patterns.forEach(pattern => {
      if (content.match(pattern.old)) {
        content = content.replace(pattern.old, pattern.new);
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed service imports in: ${filePath}`);
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
console.log('🔧 Fixing service import paths...\n');

const directories = [
  './frontend/src/components',
  './frontend/src/pages'
];

let totalFixed = 0;

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Scanning ${dir}...`);
    const files = findJSFiles(dir);
    
    files.forEach(file => {
      if (fixServiceImports(file)) {
        totalFixed++;
      }
    });
  }
});

console.log(`\n🎉 Service import fix completed!`);
console.log(`📊 Fixed ${totalFixed} files`);

// Clean up this script
setTimeout(() => {
  try {
    fs.unlinkSync('./fix-service-imports.js');
    console.log('🧹 Cleaned up fix script');
  } catch (error) {
    // Ignore cleanup errors
  }
}, 1000);
