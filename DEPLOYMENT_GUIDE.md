# 🚀 COMPLETE DEPLOYMENT GUIDE
## G-Network Social Media Platform

**Deploy your full-stack app to production in ~30 minutes!**

---

## 📋 Overview

We'll deploy:
- **Backend** → Railway (or Render) - Handles Socket.io, API, Database
- **Frontend** → Vercel - Fast, automatic deployments
- **Database** → MongoDB Atlas - Cloud-hosted, free tier
- **Auth** → Firebase - Already configured!

---

## ⚡ Quick Start (TL;DR)

```bash
# 1. Deploy Backend to Railway
cd backend
railway login
railway up
# Copy backend URL

# 2. Deploy Frontend to Vercel
cd frontend
vercel login
vercel --prod
# Done! 🎉
```

---

## 📚 Detailed Step-by-Step Guide

### 🔥 Phase 1: Prepare for Deployment (10 minutes)

#### 1.1 Install Required Dependencies
```bash
# Backend
cd backend
npm install express-rate-limit express-validator firebase-admin helmet morgan

# Frontend (if needed)
cd ../frontend
npm install
```

#### 1.2 Update .gitignore
```bash
# In project root
echo ".env" >> .gitignore
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore
echo ".DS_Store" >> .gitignore
```

#### 1.3 Setup MongoDB Atlas (Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create **Free Shared Cluster** (M0)
4. Choose region closest to you
5. **Database Access** → Add User:
   - Username: `gnetwork_admin`
   - Password: Generate secure password (save it!)
   - Database User Privileges: Read & Write
6. **Network Access** → Add IP:
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Temporary Name: "Railway/Render Access"
7. **Connect** → Get connection string:
   ```
   mongodb+srv://gnetwork_admin:<password>@cluster0.xxxxx.mongodb.net/gnetwork?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password!

#### 1.4 Setup Firebase Admin SDK

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. **Project Settings** (gear icon) → **Service Accounts**
4. Click "Generate New Private Key"
5. Download JSON file (keep it safe!)
6. Copy the JSON content - you'll need it for environment variables

---

### 🚂 Phase 2: Deploy Backend (10 minutes)

We recommend **Railway** for best Socket.io support!

#### Option A: Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init
# Enter project name: g-network-backend

# Add environment variables
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set MONGO_URI="mongodb+srv://gnetwork_admin:password@cluster0.xxxxx.mongodb.net/gnetwork"
railway variables set FRONTEND_URL="https://your-app.vercel.app"
railway variables set SESSION_SECRET="your-random-32-char-secret"
railway variables set JWT_SECRET="another-random-32-char-secret"
railway variables set GROQ_API_KEY="your-groq-key"

# Firebase Admin - paste entire JSON as one line
railway variables set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project",...}'

# Deploy!
railway up

# Get your URL
railway status
# Copy the domain: https://g-network-backend.up.railway.app
```

#### Option B: Render (Alternative)

1. Go to https://dashboard.render.com
2. **New +** → **Web Service**
3. Connect GitHub repository
4. Configure:
   - Name: `g-network-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add all environment variables (see Railway section)
6. Click **Create Web Service**
7. Wait for deployment (~5 min)
8. Copy your URL: `https://g-network-backend.onrender.com`

---

### ✅ Phase 3: Test Backend (2 minutes)

Visit your backend URL + `/health`:
```
https://your-backend.railway.app/health
```

Should see:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "mongodb": "Connected"
}
```

✅ If you see this, backend is working!

---

### 🌐 Phase 4: Deploy Frontend to Vercel (5 minutes)

#### 4.1 Get Firebase Config
1. Firebase Console → Project Settings → General
2. Scroll to "Your apps" → Web app
3. Copy configuration values

#### 4.2 Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Navigate to frontend
cd frontend

# Deploy
vercel

# Follow prompts:
# Set up and deploy? Y
# Which scope? (select your account)
# Link to existing project? N
# Project name? g-network
# Directory? ./
# Override settings? N

# Add environment variables
vercel env add VITE_API_URL production
# Enter: https://your-backend.railway.app

vercel env add VITE_FIREBASE_API_KEY production
# Enter: your_firebase_api_key

vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# Enter: your-project.firebaseapp.com

vercel env add VITE_FIREBASE_PROJECT_ID production
# Enter: your-project-id

vercel env add VITE_FIREBASE_STORAGE_BUCKET production
# Enter: your-project.appspot.com

vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
# Enter: 123456789

vercel env add VITE_FIREBASE_APP_ID production
# Enter: 1:123456:web:abc123

vercel env add VITE_FIREBASE_MEASUREMENT_ID production
# Enter: G-XXXXXXXXXX

# Deploy to production
vercel --prod

# Your frontend is live! 🎉
# Copy the URL: https://g-network-xyz123.vercel.app
```

---

### 🔗 Phase 5: Connect Frontend & Backend (3 minutes)

#### 5.1 Update Backend CORS

Go to your backend deployment platform:

**Railway:**
```bash
railway variables set FRONTEND_URL="https://your-app.vercel.app"
railway variables set CORS_ORIGIN="https://your-app.vercel.app"

# Trigger redeploy
railway up --service g-network-backend
```

**Render:**
1. Dashboard → g-network-backend → Environment
2. Add/Update:
   - `FRONTEND_URL` = `https://your-app.vercel.app`
   - `CORS_ORIGIN` = `https://your-app.vercel.app`
3. Click "Save Changes" (auto-redeploys)

#### 5.2 Update Firebase Authorized Domains

1. Firebase Console → Authentication → Settings
2. **Authorized domains** → Add domain
3. Add: `your-app.vercel.app` (without https://)
4. Save

---

### 🧪 Phase 6: Test Everything! (5 minutes)

Visit your Vercel URL and test:

- [ ] ✅ Page loads without errors
- [ ] ✅ Can sign up / login with Firebase
- [ ] ✅ Can create a post
- [ ] ✅ Can upload images
- [ ] ✅ Real-time chat works
- [ ] ✅ Notifications appear
- [ ] ✅ Profile page loads
- [ ] ✅ Can follow/unfollow users

**Open browser console (F12)** and check for:
- ❌ No CORS errors
- ❌ No 404 errors
- ✅ Socket.io connected

---

## 🎯 Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Buy domain (Namecheap, GoDaddy, etc.)
2. Vercel Dashboard → Settings → Domains
3. Add domain: `gnetwork.com`
4. Update DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
5. Wait 5-60 minutes for DNS propagation
6. Update Firebase authorized domains
7. Update backend CORS to include new domain

---

## 🔄 Making Updates After Deployment

### Update Backend
```bash
cd backend
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Railway auto-deploys from GitHub (if connected)
# Or manually:
railway up
```

### Update Frontend
```bash
cd frontend
# Make changes
git add .
git commit -m "Update UI"
git push origin main

# Vercel auto-deploys! 🎉
```

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error
```
Access to fetch blocked by CORS policy
```
**Solution:**
1. Verify backend CORS_ORIGIN exactly matches frontend URL (with https://)
2. Redeploy backend after changing CORS
3. Clear browser cache

### Issue: Socket.io Not Connecting
```
WebSocket connection failed
```
**Solution:**
1. Check VITE_API_URL in Vercel includes https://
2. Verify backend Socket.io CORS matches frontend
3. Test backend /health endpoint

### Issue: Firebase Auth Error
```
auth/unauthorized-domain
```
**Solution:**
Add Vercel domain to Firebase authorized domains

### Issue: Backend Sleeping (Render Free Tier)
```
Slow first request after inactivity
```
**Solution:**
1. Upgrade to paid plan ($7/month)
2. Use UptimeRobot to ping /health every 10 min

### Issue: Environment Variables Not Working
**Solution:**
1. Vercel: Must start with `VITE_`
2. Redeploy after adding env vars
3. Check spelling matches exactly

---

## 💰 Total Cost

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| **Railway** | 500 hrs/month | $5/month (500 hrs) |
| **Render** | 750 hrs/month | $7/month (always-on) |
| **Vercel** | Unlimited deploys | $20/month (Pro) |
| **MongoDB Atlas** | 512MB storage | $9/month (2GB) |
| **Firebase** | Free for most apps | Pay-as-you-go |

**Total Monthly (Free):** $0 🎉  
**Total Monthly (Paid):** ~$15-20 for production-ready

---

## 📊 Architecture Diagram

```
┌─────────────────┐
│   Vercel        │
│   (Frontend)    │◄──── Users
│   React + Vite  │
└────────┬────────┘
         │ HTTPS
         │ WebSocket
         ▼
┌─────────────────┐
│   Railway       │
│   (Backend)     │
│   Node + Socket │
└────────┬────────┘
         │
    ┌────┴────┬─────────┐
    ▼         ▼         ▼
┌─────┐  ┌────────┐  ┌──────┐
│ Mongo│  │Firebase│  │ Groq │
│Atlas │  │  Auth  │  │  AI  │
└─────┘  └────────┘  └──────┘
```

---

## ✅ Final Checklist

Before going live:

- [ ] Backend deployed and health check passes
- [ ] Frontend deployed to Vercel
- [ ] MongoDB Atlas configured and connected
- [ ] Firebase authorized domains updated
- [ ] Backend CORS matches frontend URL
- [ ] All environment variables set correctly
- [ ] Tested login/signup
- [ ] Tested real-time features (chat, notifications)
- [ ] Tested image uploads
- [ ] Checked browser console for errors
- [ ] (Optional) Custom domain configured
- [ ] (Optional) Analytics setup

---

## 🎉 Congratulations!

Your full-stack social media platform is now **LIVE IN PRODUCTION**! 🚀

### Share Your App:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.railway.app`

### Next Steps:
1. Share with friends and get feedback
2. Monitor errors and performance
3. Add analytics (Vercel Analytics, Google Analytics)
4. Set up error tracking (Sentry)
5. Implement CI/CD testing
6. Scale as you grow!

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Firebase Docs](https://firebase.google.com/docs)

---

## 💬 Need Help?

- Check deployment guides in backend/frontend folders
- Review troubleshooting sections
- Check platform status pages
- Join developer communities

---

**Built with ❤️ using Node.js, React, MongoDB, and Firebase**

Good luck with your deployment! 🚀
