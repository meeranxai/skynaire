const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  console.log('🔨 Building React app...');
  
  // Build React app
  execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });
  
  // Create dist directory if it doesn't exist
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Copy frontend/dist to dist
  const frontendDist = path.join(__dirname, 'frontend', 'dist');
  if (fs.existsSync(frontendDist)) {
    copyDir(frontendDist, distDir);
    console.log('✅ Build complete - React app built successfully');
  } else {
    console.error('❌ frontend/dist not found');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    
    if (fs.statSync(srcFile).isDirectory()) {
      copyDir(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}
