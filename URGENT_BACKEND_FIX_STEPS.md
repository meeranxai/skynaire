# 🚨 URGENT: Fix Backend 404 Errors - EXACT STEPS

## 🔍 **PROBLEM IDENTIFIED**

Your Railway deployment is running `server-minimal.js` instead of `server.js`. The minimal server only has 3 endpoints while your frontend needs 20+ API routes.

**Current Status:**
- ❌ Railway runs `server-minimal.js` (only has `/health`, `/test`, `/api/users/sync`)
- ❌ Frontend needs `/api/posts`, `/api/stories`, `/api/chat/*`, etc.
- ❌ No Socket.io in minimal server
- ❌ No database connection in minimal server

## ✅ **SOLUTION APPLIED**

I've already fixed the Railway configuration files:
- ✅ Updated `railway.json` to run `server.js`
- ✅ Updated `Procfile` to run `server.js`

## 🚀 **IMMEDIATE ACTION REQUIRED**

### **Step 1: Set Environment Variables in Railway (CRITICAL)**

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your backend service (`g-networkc-production`)
3. Click **"Variables"** tab
4. Add these variables:

```bash
# MOST CRITICAL - CORS Configuration
FRONTEND_URL=https://mygwnetwork.vercel.app
CORS_ORIGIN=https://mygwnetwork.vercel.app

# Basic Configuration
NODE_ENV=production
PORT=5000
```

### **Step 2: Add Database & Firebase (REQUIRED for APIs)**

**MongoDB (Required for all API routes):**
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gnetwork?retryWrites=true&w=majority
```
*Replace with your actual MongoDB Atlas connection string*

**Firebase Admin (Required for authentication):**
```bash
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@your-project.iam.gserviceaccount.com",...}
```
*Replace with your actual Firebase service account JSON*

### **Step 3: Wait for Auto-Redeploy**

Railway will automatically redeploy when you add environment variables. Watch the deployment logs.

### **Step 4: Test the Fix**

**Test 1: Health Check**
```bash
curl https://g-networkc-production.up.railway.app/health
```
Should return: `{"status":"OK","mongodb":"Connected",...}`

**Test 2: API Endpoint**
```bash
curl https://g-networkc-production.up.railway.app/api/posts
```
Should return posts data (not 404)

**Test 3: Run Test Script**
```bash
cd backend
npm run test-backend
```

## 🔧 **ALTERNATIVE: Quick Railway CLI Setup**

If you have Railway CLI installed:

```bash
# Set critical variables
railway variables set FRONTEND_URL="https://mygwnetwork.vercel.app"
railway variables set CORS_ORIGIN="https://mygwnetwork.vercel.app"
railway variables set NODE_ENV="production"

# Add your MongoDB URI
railway variables set MONGO_URI="your_mongodb_connection_string"

# Add your Firebase service account
railway variables set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

## 📊 **EXPECTED RESULTS**

**Before Fix:**
- ❌ `GET /api/posts` → 404 Not Found
- ❌ `GET /api/stories` → 404 Not Found  
- ❌ WebSocket connection fails
- ❌ Frontend shows connection errors

**After Fix:**
- ✅ `GET /api/posts` → 200 OK with posts data
- ✅ `GET /api/stories` → 200 OK with stories data
- ✅ WebSocket connects successfully
- ✅ Frontend loads all data correctly

## 🚨 **TROUBLESHOOTING**

**If still getting 404s after deployment:**

1. **Check Railway Logs:**
   - Look for `🚀 Server running on port 5000`
   - Look for `✅ MongoDB Connected Successfully`
   - Should NOT see "server-minimal.js" in startup

2. **Verify Environment Variables:**
   - Go to Railway → Variables tab
   - Ensure `FRONTEND_URL` is set correctly
   - Ensure `MONGO_URI` is set (required for API routes)

3. **Test Specific Endpoints:**
   ```bash
   # Should work after fix
   curl https://g-networkc-production.up.railway.app/api/posts
   curl https://g-networkc-production.up.railway.app/api/stories
   curl https://g-networkc-production.up.railway.app/api/users/sync
   ```

## ⏰ **TIMELINE**

- **Immediate (0-5 min):** Set environment variables in Railway
- **5-10 min:** Railway auto-redeploys with new configuration
- **10-15 min:** Test endpoints and verify fix
- **15+ min:** Frontend should work completely

## 📞 **VERIFICATION CHECKLIST**

After completing steps above:

- [ ] Railway deployment logs show `server.js` starting (not `server-minimal.js`)
- [ ] Health endpoint returns MongoDB "Connected" status
- [ ] API endpoints return 200 (not 404)
- [ ] Frontend connects to backend successfully
- [ ] WebSocket connection works
- [ ] Real-time features work (chat, notifications)

## 🎯 **ROOT CAUSE SUMMARY**

The issue was simple but critical: Railway was configured to run the minimal test server instead of your full production server. Your full server has all the API routes, database connection, and Socket.io that your frontend needs.

**Files I Fixed:**
- ✅ `backend/railway.json` - Changed startup command to `server.js`
- ✅ `backend/Procfile` - Changed startup command to `server.js`

**What You Need to Do:**
- 🔧 Set environment variables in Railway Dashboard
- ⏳ Wait for auto-redeploy
- ✅ Test the endpoints

Your backend code is perfect - it just wasn't running the right server!