const admin = require('firebase-admin');

// Initialize Firebase Admin (add this to your server.js or separate config)
// Make sure to set FIREBASE_SERVICE_ACCOUNT env variable with your service account JSON

const verifyFirebaseToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'No authentication token provided' 
            });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified
        };
        
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ 
            success: false, 
            error: 'Invalid or expired token' 
        });
    }
};

module.exports = { verifyFirebaseToken };
