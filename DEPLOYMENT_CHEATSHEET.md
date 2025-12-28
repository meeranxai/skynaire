# 🚀 DEPLOYMENT QUICK REFERENCE

## One-Command Deployment

### Prerequisites Setup (One Time)
```bash
# Install tools
npm install -g @railway/cli vercel

# Login
railway login
vercel login
```

### Backend (Railway) - 3 Commands
```bash
cd backend
railway init
railway up
```

### Frontend (Vercel) - 2 Commands
```bash
cd frontend
vercel --prod
```

---

## Environment Variables Quick Copy

### Backend (.env)
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/gnetwork
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
GROQ_API_KEY=your_key
SESSION_SECRET=your_secret_32_chars
JWT_SECRET=your_secret_32_chars
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

### Frontend (.env)
```bash
VITE_API_URL=https://your-backend.railway.app
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Platform Commands

### Railway
```bash
railway login                    # Login
railway init                     # Create project
railway up                       # Deploy
railway status                   # Check status
railway logs                     # View logs
railway variables                # List env vars
railway variables set KEY=value  # Set env var
railway open                     # Open dashboard
```

### Vercel
```bash
vercel login                           # Login
vercel                                 # Deploy preview
vercel --prod                          # Deploy production
vercel env add KEY                     # Add env var
vercel env ls                          # List env vars
vercel logs                            # View logs
vercel domains add example.com         # Add domain
vercel inspect URL                     # Inspect deployment
```

### MongoDB Atlas
```bash
# Connection string format:
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority

# Example:
mongodb+srv://gnetwork_admin:SecurePass123@cluster0.abc123.mongodb.net/gnetwork?retryWrites=true&w=majority
```

---

## Health Checks

### Backend Health
```bash
curl https://your-backend.railway.app/health
```
Expected Response:
```json
{
  "status": "OK",
  "mongodb": "Connected",
  "environment": "production"
}
```

### Frontend Test
```bash
curl https://your-app.vercel.app
# Should return HTML without errors
```

### Socket.io Test
```javascript
// Browser Console
const socket = io("https://your-backend.railway.app");
socket.on("connect", () => console.log("✅ Connected!"));
socket.on("connect_error", (err) => console.log("❌ Error:", err));
```

---

## Quick Fixes

### CORS Error
```bash
# Update backend
railway variables set CORS_ORIGIN=https://your-app.vercel.app
railway up
```

### Socket.io Not Working
```bash
# Check frontend API URL
vercel env ls
# Should have VITE_API_URL with https://

# Check backend CORS
railway variables | grep CORS
```

### Firebase Auth Error
1. Go to Firebase Console
2. Authentication → Settings → Authorized domains
3. Add: `your-app.vercel.app`

---

## Monitoring Commands

### Railway Logs (Real-time)
```bash
cd backend
railway logs --follow
```

### Vercel Logs (Real-time)
```bash
cd frontend
vercel logs --follow
```

### MongoDB Connection Test
```bash
# Install mongosh
npm install -g mongosh

# Connect
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/gnetwork"

# List databases
show dbs

# Check collections
use gnetwork
show collections
```

---

## Update Deployment

### Backend Update
```bash
cd backend
git pull origin main
railway up
```

### Frontend Update
```bash
cd frontend
git pull origin main
vercel --prod
```

### Auto-Deploy (GitHub)
```bash
git add .
git commit -m "Update"
git push origin main
# Both Railway & Vercel auto-deploy! 🎉
```

---

## Rollback Deployment

### Vercel Rollback
```bash
vercel list                    # List deployments
vercel rollback URL            # Rollback to specific URL
```

### Railway Rollback
```bash
railway status                 # Check deployments
# Use dashboard to rollback to previous deployment
```

---

## Cost Tracking

### Check Usage
- **Railway**: Dashboard → Usage
- **Vercel**: Dashboard → Usage
- **MongoDB**: Atlas → Metrics
- **Firebase**: Console → Usage

### Free Tier Limits
| Service | Limit |
|---------|-------|
| Railway | 500 hours/month |
| Vercel | Unlimited deploys, 100GB bandwidth |
| MongoDB | 512MB storage |
| Firebase | 50K reads/day, 20K writes/day |

---

## Troubleshooting One-Liners

```bash
# Check if backend is up
curl -I https://your-backend.railway.app/health

# Check MongoDB connection
railway logs | grep MongoDB

# Check Vercel build
vercel logs --prod | grep error

# Test API endpoint
curl https://your-backend.railway.app/api/users/sync \
  -H "Content-Type: application/json" \
  -d '{"firebaseUid":"test"}'

# Clear Vercel cache
vercel --force

# Restart Railway service
railway up --detach

# Check DNS propagation
nslookup your-domain.com
```

---

## Emergency Contacts

| Issue | Solution |
|-------|----------|
| 🔥 Site Down | Check `/health` endpoint |
| 🔥 CORS Error | Update CORS_ORIGIN, redeploy |
| 🔥 DB Connection | Check MongoDB IP whitelist (0.0.0.0/0) |
| 🔥 Auth Failed | Check Firebase authorized domains |
| 🔥 Socket.io Failed | Check VITE_API_URL includes https:// |

---

## Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- Firebase Console: https://console.firebase.google.com

---

## Status Page URLs

After deployment, bookmark these:
- Backend Health: `https://your-backend.railway.app/health`
- Frontend: `https://your-app.vercel.app`
- Vercel Deploy Status: `https://vercel.com/[username]/[project]`
- Railway Deploy Status: `https://railway.app/project/[id]`

---

**Keep this cheat sheet handy! Bookmark or print it.** 🚀
