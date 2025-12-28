# 📋 PRE-DEPLOYMENT CHECKLIST

**Complete this checklist before deploying to production!**

---

## ✅ Backend Preparation

### Security & Dependencies
- [ ] All new dependencies installed (`npm install` in backend)
- [ ] `.env` file exists locally (not committed!)
- [ ] `.env.example` updated with all required variables
- [ ] `.gitignore` includes `.env` and `node_modules/`
- [ ] Firebase Admin SDK JSON downloaded
- [ ] Auth middleware created (`middleware/auth.js`)
- [ ] Rate limiting middleware added
- [ ] Error handler middleware added
- [ ] Helmet security headers configured
- [ ] CORS properly configured for production

### Database
- [ ] MongoDB Atlas account created
- [ ] Free cluster (M0) provisioned
- [ ] Database user created with password saved
- [ ] IP whitelist set to 0.0.0.0/0
- [ ] Connection string obtained and tested
- [ ] Database indexes reviewed in models

### Code Quality
- [ ] All console.logs reviewed (sensitive data removed)
- [ ] No hardcoded secrets in code
- [ ] Error handling implemented for all routes
- [ ] Graceful shutdown handlers added
- [ ] Health check endpoint working
- [ ] All routes tested locally

### Testing
- [ ] Backend runs locally without errors
- [ ] Can connect to MongoDB Atlas from local
- [ ] All API endpoints tested with Postman/Thunder Client
- [ ] Socket.io connections work locally
- [ ] File uploads work
- [ ] Authentication works with Firebase

---

## ✅ Frontend Preparation

### Configuration
- [ ] All dependencies installed (`npm install` in frontend)
- [ ] `.env.example` created with all variables
- [ ] `.env` file exists locally (not committed!)
- [ ] Firebase config obtained from console
- [ ] API config uses environment variables
- [ ] Build succeeds locally (`npm run build`)
- [ ] Production build tested (`npm run preview`)

### Code Quality
- [ ] No console.logs with sensitive data
- [ ] All API calls use VITE_API_URL
- [ ] Error boundaries implemented
- [ ] Loading states for async operations
- [ ] Proper error messages for users
- [ ] Images optimized (compressed)

### Testing
- [ ] App runs in dev mode without errors
- [ ] Production build works (`npm run build && npm run preview`)
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Navigation works
- [ ] Mobile responsive design tested

---

## ✅ Platform Setup

### MongoDB Atlas
- [ ] Account created
- [ ] Cluster created (Free M0)
- [ ] Database user created
- [ ] Password saved securely
- [ ] Network access: 0.0.0.0/0 added
- [ ] Connection string tested

### Firebase
- [ ] Project created
- [ ] Authentication enabled (Email/Password, Google, etc.)
- [ ] Service Account JSON downloaded
- [ ] Web app configuration obtained
- [ ] Firebase SDK initialized in frontend

### Railway (or Render)
- [ ] Account created
- [ ] CLI installed (`npm i -g @railway/cli`)
- [ ] Logged in (`railway login`)
- [ ] Project created (`railway init`)

### Vercel
- [ ] Account created
- [ ] CLI installed (`npm i -g vercel`)
- [ ] Logged in (`vercel login`)
- [ ] GitHub repository connected (optional)

---

## ✅ Environment Variables

### Backend Variables Ready
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `MONGO_URI` (MongoDB Atlas connection string)
- [ ] `FRONTEND_URL` (will set after Vercel deploy)
- [ ] `CORS_ORIGIN` (same as FRONTEND_URL)
- [ ] `GROQ_API_KEY` (if using AI features)
- [ ] `GOOGLE_API_KEY` (if using Gemini)
- [ ] `SESSION_SECRET` (random 32 chars)
- [ ] `JWT_SECRET` (random 32 chars)
- [ ] `FIREBASE_SERVICE_ACCOUNT` (full JSON)

### Frontend Variables Ready
- [ ] `VITE_API_URL` (will set after backend deploy)
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_MEASUREMENT_ID`

---

## ✅ Git & Version Control

### Repository
- [ ] Code pushed to GitHub/GitLab
- [ ] `.gitignore` properly configured
- [ ] No `.env` files in repository
- [ ] No `node_modules/` in repository
- [ ] README.md updated with project info
- [ ] All branches merged to main/master

### Clean Slate
- [ ] No uncommitted changes
- [ ] No sensitive data in commit history
- [ ] Repository is public or accessible to deployment platforms

---

## ✅ Deployment Steps

### Phase 1: Backend Deployment
- [ ] Backend deployed to Railway/Render
- [ ] Health check endpoint accessible
- [ ] MongoDB connected (check logs)
- [ ] Backend URL saved (e.g., `https://your-backend.railway.app`)

### Phase 2: Frontend Deployment
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Build successful
- [ ] Frontend URL saved (e.g., `https://your-app.vercel.app`)

### Phase 3: Integration
- [ ] Backend CORS updated with frontend URL
- [ ] Backend FRONTEND_URL updated
- [ ] Backend redeployed with new CORS
- [ ] Firebase authorized domains updated with Vercel URL

---

## ✅ Post-Deployment Testing

### Basic Functionality
- [ ] Frontend loads without errors
- [ ] Backend /health endpoint returns 200 OK
- [ ] No CORS errors in browser console
- [ ] No 404 errors for assets

### Authentication
- [ ] Can sign up with email/password
- [ ] Can log in with email/password
- [ ] Can log in with Google (if enabled)
- [ ] User session persists on refresh
- [ ] Can log out

### Core Features
- [ ] Can create a post
- [ ] Posts appear in feed
- [ ] Can upload images
- [ ] Images display correctly
- [ ] Can like/unlike posts
- [ ] Can comment on posts
- [ ] Can follow/unfollow users
- [ ] Profile page loads

### Real-time Features
- [ ] Socket.io connects (check console)
- [ ] Can send chat messages
- [ ] Messages appear in real-time
- [ ] Online/offline status updates
- [ ] Typing indicators work
- [ ] Notifications appear

### Performance
- [ ] Page loads in under 3 seconds
- [ ] Images load properly
- [ ] No memory leaks in console
- [ ] Mobile view works correctly

---

## ✅ Monitoring & Maintenance

### Setup Monitoring
- [ ] Vercel Analytics enabled (optional)
- [ ] Railway/Render alerts configured
- [ ] MongoDB Atlas alerts configured
- [ ] Uptime monitor set up (UptimeRobot, optional)

### Documentation
- [ ] Deployment guides reviewed
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Known issues documented

### Backup Plan
- [ ] Database backup strategy in place
- [ ] Know how to rollback deployment
- [ ] Support/help resources identified
- [ ] Contact information for issues

---

## ✅ Optional Enhancements

### Performance
- [ ] CDN configured for static assets
- [ ] Images optimized and compressed
- [ ] Code splitting implemented
- [ ] Lazy loading for routes

### SEO & Analytics
- [ ] Meta tags configured
- [ ] Open Graph tags added
- [ ] Google Analytics integrated
- [ ] Sitemap generated

### Security
- [ ] Rate limiting tested
- [ ] Input validation on all forms
- [ ] XSS protection verified
- [ ] HTTPS enforced everywhere
- [ ] Security headers checked

### User Experience
- [ ] Loading states for all async ops
- [ ] Error messages are user-friendly
- [ ] Success messages for actions
- [ ] 404 page customized
- [ ] Favicon added

---

## 🚨 Common Pitfalls to Avoid

❌ **Don't:**
- Deploy without testing locally first
- Commit `.env` files to Git
- Use same secrets in dev and production
- Skip the health check endpoint test
- Forget to update CORS after Vercel deploy
- Use `localhost` in production env vars
- Leave debug logs in production
- Forget to whitelist 0.0.0.0/0 in MongoDB

✅ **Do:**
- Test everything locally before deploying
- Use strong, unique secrets
- Monitor logs after deployment
- Keep environment variables documented
- Test on mobile devices
- Have a rollback plan
- Celebrate when it works! 🎉

---

## 📞 Need Help?

If you get stuck:

1. Check the error message carefully
2. Review the deployment logs
3. Check the troubleshooting section in deployment guides
4. Verify all environment variables are set correctly
5. Test each component individually (DB, Backend, Frontend)
6. Check platform status pages
7. Search for the error on Google/Stack Overflow
8. Ask in community forums

---

## ✅ Final Sign-Off

I confirm that:
- [ ] All items in this checklist are complete
- [ ] I have tested the application locally
- [ ] I understand the deployment process
- [ ] I have backup plans if something goes wrong
- [ ] I'm ready to deploy to production!

**Date:** ______________  
**Deployed by:** ______________  
**Backend URL:** ______________  
**Frontend URL:** ______________  

---

## 🎉 Ready to Deploy!

If all checkboxes are ticked, you're ready!

Follow the deployment guide step-by-step and you'll have your app live in ~30 minutes.

**Good luck! 🚀**
