#!/usr/bin/env node

/**
 * Backend API Test Script
 * Tests all critical endpoints to verify deployment
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'https://g-networkc-production.up.railway.app';
const FRONTEND_ORIGIN = 'https://mygwnetwork.vercel.app';

// Test endpoints
const endpoints = [
    { path: '/health', method: 'GET', description: 'Health Check' },
    { path: '/test', method: 'GET', description: 'CORS Test' },
    { path: '/api/posts', method: 'GET', description: 'Posts API' },
    { path: '/api/stories', method: 'GET', description: 'Stories API' },
    { path: '/api/users/sync', method: 'POST', description: 'User Sync API' }
];

function makeRequest(endpoint) {
    return new Promise((resolve) => {
        const url = new URL(BASE_URL + endpoint.path);
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: endpoint.method,
            headers: {
                'Origin': FRONTEND_ORIGIN,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    endpoint: endpoint.path,
                    status: res.statusCode,
                    headers: res.headers,
                    data: data.substring(0, 200) + (data.length > 200 ? '...' : ''),
                    success: res.statusCode < 400
                });
            });
        });

        req.on('error', (err) => {
            resolve({
                endpoint: endpoint.path,
                status: 'ERROR',
                error: err.message,
                success: false
            });
        });

        if (endpoint.method === 'POST') {
            req.write(JSON.stringify({ test: true }));
        }
        
        req.end();
    });
}

async function testBackend() {
    console.log('🧪 Testing Backend API Endpoints...\n');
    console.log(`📍 Base URL: ${BASE_URL}`);
    console.log(`🌐 Origin: ${FRONTEND_ORIGIN}\n`);

    const results = [];
    
    for (const endpoint of endpoints) {
        console.log(`Testing ${endpoint.description} (${endpoint.method} ${endpoint.path})...`);
        const result = await makeRequest(endpoint);
        results.push(result);
        
        if (result.success) {
            console.log(`✅ ${result.status} - Success`);
        } else {
            console.log(`❌ ${result.status} - Failed`);
            if (result.error) console.log(`   Error: ${result.error}`);
        }
        
        // Check CORS headers
        if (result.headers && result.headers['access-control-allow-origin']) {
            console.log(`🔒 CORS: ${result.headers['access-control-allow-origin']}`);
        } else if (result.success) {
            console.log(`⚠️  CORS: No Access-Control-Allow-Origin header`);
        }
        
        console.log('');
    }

    // Summary
    console.log('📊 SUMMARY:');
    console.log('='.repeat(50));
    
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`✅ Successful: ${successful}/${total}`);
    console.log(`❌ Failed: ${total - successful}/${total}`);
    
    if (successful === total) {
        console.log('\n🎉 All tests passed! Backend is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Check the errors above.');
        
        // Specific guidance
        const healthFailed = !results.find(r => r.endpoint === '/health')?.success;
        const apisFailed = results.filter(r => r.endpoint.startsWith('/api/') && !r.success).length > 0;
        
        if (healthFailed) {
            console.log('\n🚨 Health check failed - Backend may not be running');
        }
        
        if (apisFailed) {
            console.log('\n🚨 API endpoints failed - Check if full server.js is running (not server-minimal.js)');
        }
    }

    console.log('\n📋 Next Steps:');
    console.log('1. If health check fails: Check Railway deployment logs');
    console.log('2. If APIs fail: Ensure server.js is running (not server-minimal.js)');
    console.log('3. If CORS fails: Check FRONTEND_URL environment variable');
    console.log('4. Test WebSocket: Open browser console and check Socket.io connection');
}

// Run tests
testBackend().catch(console.error);