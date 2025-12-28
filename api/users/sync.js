// Vercel Serverless Function - User Sync
export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'POST') {
        console.log('User sync request:', req.body);
        
        res.status(200).json({
            message: 'User synced successfully (Vercel Serverless)',
            user: req.body,
            timestamp: new Date().toISOString(),
            platform: 'Vercel Serverless'
        });
    } else {
        res.status(200).json({
            message: 'User sync endpoint working (Vercel Serverless)',
            timestamp: new Date().toISOString(),
            platform: 'Vercel Serverless'
        });
    }
}