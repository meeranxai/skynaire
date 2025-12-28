const fs = require('fs');
const path = require('path');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy frontend/public to dist
const publicDir = path.join(__dirname, 'frontend', 'public');
const files = fs.readdirSync(publicDir);

files.forEach(file => {
  const src = path.join(publicDir, file);
  const dest = path.join(distDir, file);
  
  if (fs.statSync(src).isDirectory()) {
    // Copy directory recursively
    copyDir(src, dest);
  } else {
    // Copy file
    fs.copyFileSync(src, dest);
  }
});

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

console.log('✅ Build complete - files copied to dist');
