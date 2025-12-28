# ================================
# RAILWAY DEPLOYMENT GUIDE
# ================================

## Prerequisites
1. Railway account (https://railway.app)
2. MongoDB Atlas account (https://mongodb.com/atlas)
3. Firebase project with Admin SDK

## Step 1: Prepare MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Create a new cluster (FREE tier available)
3. Create database user with password
4. Add IP: 0.0.0.0/0 to allow Railway connections
5. Get connection string: mongodb+srv://...

## Step 2: Setup Railway Project
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Link to Railway project
railway link
```

## Step 3: Configure Environment Variables
Go to Railway Dashboard > Your Project > Variables and add:

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gnetwork
FRONTEND_URL=https://your-app.vercel.app
GROQ_API_KEY=your_groq_key
GOOGLE_API_KEY=your_google_key
SESSION_SECRET=random-secret-key-32-chars
JWT_SECRET=another-random-secret-key
```

For Firebase Admin SDK, add one of:
```
# Option 1: Full JSON (preferred)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# Option 2: Individual fields
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

## Step 4: Deploy
```bash
# Deploy to Railway
railway up

# Or use GitHub integration:
# 1. Push code to GitHub
# 2. Connect repo in Railway dashboard
# 3. Auto-deploys on push to main branch
```

## Step 5: Get Backend URL
After deployment, Railway provides a URL like:
```
https://your-app.railway.app
```

Copy this URL for frontend configuration!

## Step 6: Health Check
Visit: https://your-app.railway.app/health

Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "mongodb": "Connected"
}
```

## Troubleshooting
- **MongoDB not connecting**: Check IP whitelist (0.0.0.0/0)
- **Build fails**: Run `npm install` locally first
- **Socket.io not working**: Check CORS settings match frontend URL
- **500 errors**: Check Railway logs: `railway logs`

## Cost
- Railway: Free tier includes 500 hours/month
- MongoDB Atlas: Free tier (M0) includes 512MB storage

## Files Required
✅ package.json
✅ server.js
✅ .env (locally, not committed)
❌ Do NOT commit .env to Git!
