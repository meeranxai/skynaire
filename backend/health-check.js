#!/usr/bin/env node

/**
 * G-Network Health Check Script
 * Run this to verify your setup is correct
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('\n🔍 G-Network Health Check\n');
console.log('='.repeat(50));

let errors = 0;
let warnings = 0;

// Check 1: Node Modules
console.log('\n📦 Checking Dependencies...');
const frontendNodeModules = fs.existsSync(path.join(__dirname, '../frontend/node_modules'));
const backendNodeModules = fs.existsSync(path.join(__dirname, '../node_modules'));

if (frontendNodeModules) {
    console.log('✅ Frontend dependencies installed');
} else {
    console.log('❌ Frontend dependencies missing! Run: cd frontend && npm install');
    errors++;
}

if (backendNodeModules) {
    console.log('✅ Backend dependencies installed');
} else {
    console.log('❌ Backend dependencies missing! Run: cd backend && npm install');
    errors++;
}

// Check 2: Environment Files
console.log('\n🔐 Checking Environment Files...');
const backendEnv = fs.existsSync(path.join(__dirname, '../.env'));
const frontendEnv = fs.existsSync(path.join(__dirname, '../frontend/.env'));

if (backendEnv) {
    console.log('✅ Backend .env exists');
    
    // Check for placeholder API key
    const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
    if (envContent.includes('your_groq_api_key_here')) {
        console.log('⚠️  Warning: GROQ_API_KEY is still a placeholder. AI features will not work.');
        warnings++;
    } else {
        console.log('✅ GROQ_API_KEY appears to be set');
    }
} else {
    console.log('❌ Backend .env missing!');
    errors++;
}

if (frontendEnv) {
    console.log('✅ Frontend .env exists');
} else {
    console.log('⚠️  Frontend .env missing (it will use defaults)');
    warnings++;
}

// Check 3: PWA Files
console.log('\n📱 Checking PWA Files...');
const serviceWorker = fs.existsSync(path.join(__dirname, '../frontend/public/service-worker.js'));
const manifest = fs.existsSync(path.join(__dirname, '../frontend/public/manifest.json'));
const offline = fs.existsSync(path.join(__dirname, '../frontend/public/offline.html'));

if (serviceWorker) {
    console.log('✅ Service worker exists');
} else {
    console.log('❌ Service worker missing!');
    errors++;
}

if (manifest) {
    console.log('✅ Manifest.json exists');
} else {
    console.log('❌ Manifest.json missing!');
    errors++;
}

if (offline) {
    console.log('✅ Offline page exists');
} else {
    console.log('⚠️  Offline page missing');
    warnings++;
}

// Check 4: Backend Connection (if running)
console.log('\n🌐 Checking Backend Connection...');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/health',
    method: 'GET',
    timeout: 3000
};

const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
        console.log('✅ Backend is running on port 5000');
        
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const health = JSON.parse(data);
                console.log('✅ MongoDB:', health.mongodb === 'Connected' ? 'Connected' : 'Disconnected');
                printSummary();
            } catch (e) {
                console.log('⚠️  Could not parse health check response');
                printSummary();
            }
        });
    } else {
        console.log('⚠️  Backend returned status:', res.statusCode);
        warnings++;
        printSummary();
    }
});

req.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
        console.log('⚠️  Backend not running. Start it with: cd backend && npm run dev');
        warnings++;
    } else {
        console.log('⚠️  Could not connect to backend:', err.message);
        warnings++;
    }
    printSummary();
});

req.on('timeout', () => {
    console.log('⚠️  Backend connection timeout');
    warnings++;
    req.destroy();
    printSummary();
});

req.end();

function printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Summary:\n');
    
    if (errors === 0 && warnings === 0) {
        console.log('🎉 Everything looks perfect!');
        console.log('\n📋 Next Steps:');
        console.log('1. Start backend: cd backend && npm run dev');
        console.log('2. Start frontend: cd frontend && npm run dev');
        console.log('3. Open http://localhost:5173');
    } else {
        if (errors > 0) {
            console.log(`❌ ${errors} critical error(s) found`);
        }
        if (warnings > 0) {
            console.log(`⚠️  ${warnings} warning(s) found`);
        }
        
        console.log('\n📖 See ERROR_FIXES.md for detailed solutions');
        console.log('📖 See QUICK_START.md for setup instructions');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    process.exit(errors > 0 ? 1 : 0);
}
