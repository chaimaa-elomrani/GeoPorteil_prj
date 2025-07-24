const fs = require('fs');
const path = require('path');

// Function to fix cross-folder component imports
function fixCrossFolderImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Define the mapping for cross-folder imports
    const crossFolderMappings = {
      // From any folder to layout
      './layout/AdminLayout': '../layout/AdminLayout',
      './layout/Header': '../layout/Header',
      './layout/Sidebar': '../layout/Sidebar',
      
      // From any folder to dashboard
      './dashboard/AdminDashboard': '../dashboard/AdminDashboard',
      './dashboard/Dashboard': '../dashboard/Dashboard',
      './dashboard/DashboardOverview': '../dashboard/DashboardOverview',
      './dashboard/DashboardStats': '../dashboard/DashboardStats',
      
      // From any folder to users
      './users/UserForm': '../users/UserForm',
      './users/UserManagement': '../users/UserManagement',
      './users/UserTable': '../users/UserTable',
      './users/SignupRequests': '../users/SignupRequests',
      
      // From any folder to modals
      './modals/ApprovalModal': '../modals/ApprovalModal',
      './modals/ConfirmationModal': '../modals/ConfirmationModal',
      './modals/RejectionModal': '../modals/RejectionModal',
      
      // From any folder to projects (but within projects folder, use relative)
      './projects/ProjectCreate': '../projects/ProjectCreate',
      './projects/ProjectCreateNew': '../projects/ProjectCreateNew',
      './projects/ProjectDetail': '../projects/ProjectDetail',
      './projects/ProjectDetailElegant': '../projects/ProjectDetailElegant',
      './projects/ProjectDetailNew': '../projects/ProjectDetailNew',
      './projects/ProjectEdit': '../projects/ProjectEdit',
      './projects/ProjectsDashboard': '../projects/ProjectsDashboard',
      './projects/BuildingSurveyDetail': '../projects/BuildingSurveyDetail',
      './projects/GeoJsonImport': '../projects/GeoJsonImport',
      './projects/GeoJsonProjectImport': '../projects/GeoJsonProjectImport',
      './projects/GeoJsonViewer': '../projects/GeoJsonViewer',
      
      // From any folder to maps
      './maps/ProjectsMap': '../maps/ProjectsMap',
      './maps/ProjectsMapWithProject': '../maps/ProjectsMapWithProject',
      
      // From any folder to security
      './security/SecureGeoDataManager': '../security/SecureGeoDataManager',
      './security/SecurityDemo': '../security/SecurityDemo',
      
      // From any folder to common
      './common/ErrorMessage': '../common/ErrorMessage',
      './common/Toast': '../common/Toast'
    };
    
    // Special handling for files within the same folder
    if (filePath.includes('/projects/')) {
      // Within projects folder, these should be relative
      const withinProjectsMappings = {
        './projects/GeoJsonProjectImport': './GeoJsonProjectImport',
        './projects/GeoJsonImport': './GeoJsonImport',
        './projects/GeoJsonViewer': './GeoJsonViewer',
        './projects/BuildingSurveyDetail': './BuildingSurveyDetail',
        './projects/ProjectCreate': './ProjectCreate',
        './projects/ProjectCreateNew': './ProjectCreateNew',
        './projects/ProjectDetail': './ProjectDetail',
        './projects/ProjectDetailElegant': './ProjectDetailElegant',
        './projects/ProjectDetailNew': './ProjectDetailNew',
        './projects/ProjectEdit': './ProjectEdit',
        './projects/ProjectsDashboard': './ProjectsDashboard'
      };
      Object.assign(crossFolderMappings, withinProjectsMappings);
    }
    
    // Apply the mappings
    Object.entries(crossFolderMappings).forEach(([oldImport, newImport]) => {
      const regex = new RegExp(`(['"])${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1`, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, `$1${newImport}$1`);
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed cross-folder imports in: ${filePath}`);
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
console.log('🔧 Fixing cross-folder component imports...\n');

const directories = [
  './frontend/src/components'
];

let totalFixed = 0;

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Scanning ${dir}...`);
    const files = findJSFiles(dir);
    
    files.forEach(file => {
      if (fixCrossFolderImports(file)) {
        totalFixed++;
      }
    });
  }
});

console.log(`\n🎉 Cross-folder import fix completed!`);
console.log(`📊 Fixed ${totalFixed} files`);

// Clean up this script
setTimeout(() => {
  try {
    fs.unlinkSync('./fix-cross-folder-imports.js');
    console.log('🧹 Cleaned up fix script');
  } catch (error) {
    // Ignore cleanup errors
  }
}, 1000);
