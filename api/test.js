// Vercel Serverless Function - Test Endpoint
export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    res.status(200).json({
        message: 'CORS Test Successful! (Vercel Serverless)',
        origin: req.headers.origin,
        timestamp: new Date().toISOString(),
        platform: 'Vercel Serverless',
        method: req.method,
        url: req.url
    });
}