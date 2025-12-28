# Railway Backend Configuration Fix

## Current Issues:
1. ❌ MongoDB URI missing/invalid
2. ❌ Firebase Admin service account missing  
3. ❌ Groq API key missing

## Required Environment Variables for Railway:

### 1. MongoDB Configuration
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gnetwork?retryWrites=true&w=majority
```

### 2. Firebase Admin SDK
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"g-network-community","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@g-network-community.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-...%40g-network-community.iam.gserviceaccount.com"}
```

### 3. Basic Configuration
```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://mygwnetwork.vercel.app
CORS_ORIGIN=https://mygwnetwork.vercel.app
```

### 4. Optional (AI Features)
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Steps to Fix:

### 1. MongoDB Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a cluster or use existing
3. Get connection string
4. Add to Railway environment variables

### 2. Firebase Service Account
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Project Settings → Service Accounts
3. Generate new private key
4. Copy the entire JSON content
5. Add as `FIREBASE_SERVICE_ACCOUNT` in Railway

### 3. Railway Environment Variables
1. Go to Railway dashboard
2. Select your backend service
3. Go to Variables tab
4. Add all required environment variables

## Quick Fix Commands:
```bash
# Set MongoDB URI
railway variables set MONGO_URI="your_mongodb_connection_string"

# Set Firebase Service Account (escape quotes)
railway variables set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Set CORS origin
railway variables set CORS_ORIGIN="https://mygwnetwork.vercel.app"
railway variables set FRONTEND_URL="https://mygwnetwork.vercel.app"
```

## Status:
- ⏳ Environment variables need to be configured in Railway dashboard
- ⏳ MongoDB Atlas connection string required
- ⏳ Firebase service account JSON required