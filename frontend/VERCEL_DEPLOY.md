# ================================
# VERCEL FRONTEND DEPLOYMENT GUIDE
# ================================

## Prerequisites
1. Vercel account (https://vercel.com)
2. GitHub repository with your frontend code
3. Backend deployed (Railway/Render)
4. Firebase project configured

## 🚀 Quick Deploy (Recommended)

### Step 1: Deploy Backend First
Complete backend deployment using Railway or Render guide.
Get your backend URL (e.g., `https://your-backend.railway.app`)

### Step 2: Prepare Frontend
```bash
cd frontend

# Create .env file (don't commit!)
cp .env.example .env

# Edit .env with your values
nano .env
```

Add to `.env`:
```env
VITE_API_URL=https://your-backend.railway.app
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 3: Test Locally
```bash
npm install
npm run dev
```
Visit http://localhost:5173 and verify it works!

### Step 4: Push to GitHub
```bash
# Make sure .env is in .gitignore
echo ".env" >> .gitignore
echo "dist/" >> .gitignore
echo "node_modules/" >> .gitignore

git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 5: Deploy to Vercel

#### Option A: Vercel Dashboard (Easiest)
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (if in monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variables:
   Click "Environment Variables" and add each:
   ```
   VITE_API_URL → https://your-backend.railway.app
   VITE_FIREBASE_API_KEY → your_key
   VITE_FIREBASE_AUTH_DOMAIN → your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID → your-project-id
   VITE_FIREBASE_STORAGE_BUCKET → your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID → 123456789
   VITE_FIREBASE_APP_ID → 1:123456:web:abc123
   VITE_FIREBASE_MEASUREMENT_ID → G-XXXXXXXXXX
   ```

5. Click "Deploy"
6. Wait 2-3 minutes
7. Get your URL: `https://your-app.vercel.app`

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? g-network
# - Directory? ./
# - Build command? npm run build
# - Output directory? dist

# Set environment variables
vercel env add VITE_API_URL
# Enter: https://your-backend.railway.app

# Repeat for all variables

# Deploy to production
vercel --prod
```

## Step 6: Update Backend CORS

Go to your backend's environment variables and update:
```
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
```

Redeploy backend for changes to take effect!

## Step 7: Configure Firebase

1. Go to Firebase Console
2. Authentication > Settings > Authorized domains
3. Add: `your-app.vercel.app`

## Step 8: Test Everything

Visit `https://your-app.vercel.app` and test:
- ✅ Login works
- ✅ Posts load
- ✅ Real-time chat works
- ✅ Images upload
- ✅ Notifications work

## 🎯 Custom Domain (Optional)

1. In Vercel Dashboard > Settings > Domains
2. Add your domain (e.g., `gnetwork.com`)
3. Update DNS records:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-60 minutes)
5. Update Firebase authorized domains
6. Update backend CORS_ORIGIN

## 🔄 Auto-Deploy

Vercel automatically deploys when you push to GitHub!

```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel auto-deploys! 🎉
```

## 🐛 Troubleshooting

### Build Fails
```bash
# Test build locally first
npm run build

# Check for:
- Missing dependencies
- TypeScript errors
- Environment variables missing
```

### API Requests Fail (CORS Error)
```
❌ Access to fetch blocked by CORS policy
```
**Fix**: 
1. Check backend CORS_ORIGIN matches Vercel URL exactly
2. Include https:// in VITE_API_URL
3. Redeploy backend after changing CORS

### Firebase Auth Not Working
```
❌ Firebase: Error (auth/unauthorized-domain)
```
**Fix**: Add Vercel domain to Firebase authorized domains

### Socket.io Not Connecting
```
❌ WebSocket connection failed
```
**Fix**: 
1. Ensure VITE_API_URL points to backend with https://
2. Check backend Socket.io CORS settings
3. Verify backend is running (visit /health endpoint)

### Environment Variables Not Loading
**Fix**:
1. Must start with `VITE_` for Vite to expose them
2. Redeploy after adding new env vars
3. Check Vercel Dashboard > Settings > Environment Variables

### Images/Media Not Loading
```
❌ 404 on /uploads/...
```
**Fix**: Check `getMediaUrl()` function uses correct backend URL

## 📊 Performance Optimization

### Enable Vercel Analytics (Optional)
1. Vercel Dashboard > Analytics > Enable
2. Get insights on performance

### Edge Functions (Advanced)
For ultra-fast API responses, consider:
```javascript
// pages/api/health.js
export const config = { runtime: 'edge' };
export default async function handler(req) {
  return new Response(JSON.stringify({ status: 'OK' }));
}
```

## 💰 Cost

### Vercel Pricing
- **Free (Hobby)**:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic SSL
  - Perfect for personal projects!

- **Pro ($20/month)**:
  - Team collaboration
  - More bandwidth
  - Analytics
  - Password protection

## 📱 Preview Deployments

Every git branch gets its own preview URL!
```bash
git checkout -b feature-new-ui
git push origin feature-new-ui
# Vercel creates: https://your-app-git-feature-new-ui.vercel.app
```

## ✅ Deployment Checklist

- [ ] Backend deployed and health check passes
- [ ] `.env` file created (not committed)
- [ ] All environment variables set in Vercel
- [ ] Firebase authorized domains updated
- [ ] Backend CORS updated with Vercel URL
- [ ] Test login works
- [ ] Test real-time features
- [ ] Custom domain configured (optional)

## 🎉 You're Done!

Your full-stack app is now live:
- Frontend: https://your-app.vercel.app
- Backend: https://your-backend.railway.app

Share with the world! 🚀

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Community: https://github.com/vercel/vercel/discussions
