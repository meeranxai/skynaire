# ================================
# RENDER DEPLOYMENT GUIDE
# ================================

## Prerequisites
1. Render account (https://render.com)
2. MongoDB Atlas account
3. Firebase Admin SDK JSON
4. GitHub repository

## Step 1: Prepare Repository
```bash
# Make sure .gitignore includes .env
echo ".env" >> .gitignore
echo "node_modules/" >> .gitignore

# Commit and push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Create Web Service on Render
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: g-network-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

## Step 3: Environment Variables
Add in Render Dashboard > Environment:

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/gnetwork
FRONTEND_URL=https://your-app.vercel.app
GROQ_API_KEY=your_key
GOOGLE_API_KEY=your_key
SESSION_SECRET=your-random-32-char-secret
JWT_SECRET=your-random-32-char-secret
```

Firebase Admin (choose one):
```
# Option 1: Full JSON as string
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Option 2: Separate fields
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nyour-key\n-----END
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

## Step 4: Deploy
1. Click "Create Web Service"
2. Render will automatically deploy
3. Wait for build to complete (~5 min)
4. Get your URL: `https://g-network-backend.onrender.com`

## Step 5: Configure Custom Domain (Optional)
1. Go to Settings > Custom Domains
2. Add your domain
3. Update DNS records as instructed

## Health Check
Visit: https://your-backend.onrender.com/health

## Important Notes

### Free Tier Limitations
⚠️ Render free tier:
- Spins down after 15 min of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month free
- Solution: Upgrade to paid ($7/month) for always-on

### Keep-Alive Service (Optional)
To prevent sleep on free tier, use a service like:
- UptimeRobot (https://uptimerobot.com)
- Ping your /health endpoint every 10 minutes

## Monitoring
```bash
# View logs
# Go to Render Dashboard > Logs tab
# Or use Render CLI
```

## Auto-Deploy
Render automatically deploys when you push to GitHub main branch!

## Troubleshooting

### Build Fails
- Check Node version in package.json
- Ensure all dependencies are in package.json
- Check build logs for errors

### App Crashes
- Check environment variables are set correctly
- View logs in Render dashboard
- Ensure MongoDB connection string is correct

### Socket.io Issues
- Verify CORS settings match frontend URL
- Check WebSocket support is enabled (default on Render)

## Render.yaml (Optional)
Create `render.yaml` in backend root for infrastructure as code:

```yaml
services:
  - type: web
    name: g-network-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
```

## Cost Comparison
- Free: 750 hours/month, sleeps after 15 min
- Starter ($7/month): Always on, 0.1 CPU, 512MB RAM
- Standard ($25/month): Better performance

## Files Required
✅ package.json with start script
✅ server.js
✅ All dependencies installed
❌ Don't commit .env
