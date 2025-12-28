# 🚀 G-Network Quick Start Guide

Get your G-Network app running in 5 minutes!

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (already configured ✅)

---

## Step 1: Install Dependencies

```bash
# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

---

## Step 2: Start the Backend

```bash
cd backend
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5000
📝 Environment: development
🔌 Socket.io enabled
✅ MongoDB Connected
```

**Leave this terminal running!**

---

## Step 3: Start the Frontend

Open a NEW terminal window:

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 4: Open Your App

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the G-Network login page!

---

## 🎉 First Time Setup

### Create Your Account:
1. Click "Sign up" or use "Google Sign In"
2. Fill in your details (or use Google)
3. You'll be redirected to the home feed

### Test Key Features:
- ✅ Create a post
- ✅ Visit your profile
- ✅ Try the chat feature
- ✅ Check notifications
- ✅ Explore other users (if any)

---

## 🔑 Enable AI Features (Optional)

To enable AI-powered features:

1. Get a Groq API key: https://console.groq.com/keys
2. Open `backend/.env`
3. Replace:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```
   With:
   ```
   GROQ_API_KEY=gsk_your_actual_api_key
   ```
4. Update:
   ```
   ENABLE_AI_ANALYSIS=true
   ```
5. Restart the backend server (Ctrl+C, then `npm run dev` again)

---

## 📱 Test PWA Features

### Install as App:
1. In Chrome/Edge, look for the install icon in the address bar
2. Click "Install G-Network"
3. App opens in its own window!

### Test Offline:
1. Open DevTools (F12)
2. Go to Network tab
3. Set to "Offline"
4. Refresh page
5. You should see the offline page

---

## 🐛 Troubleshooting

### "Cannot connect to Backend"
**Solution:**
```bash
# Check if backend is running:
curl http://localhost:5000/health

# If not running, restart:
cd backend
npm run dev
```

### Port Already in Use
**Backend (5000):**
```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

**Frontend (5173):**
```bash
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

### Login Not Working
1. Check browser console (F12) for errors
2. Verify backend is running
3. Check Firebase configuration in `frontend/src/firebase.js`
4. Try clearing browser cache (Ctrl+Shift+Delete)

### Service Worker Errors
Don't worry! The app works fine without it. Service workers are for offline features only.

---

## 🎨 Customize Your App

### Change App Theme:
Edit `frontend/src/styles/design-system.css`:
```css
:root {
    --primary: #667eea;  /* Change this color! */
    --secondary: #764ba2;
}
```

### Change App Name:
1. `frontend/index.html` → `<title>Your App Name</title>`
2. `frontend/public/manifest.json` → `"name": "Your App Name"`
3. Look for "G-Network" in components and replace

### Add Features:
Check out the `frontend/src/pages/` folder to see how pages work!

---

## 📚 Project Structure

```
G-Network/
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages
│   │   ├── contexts/     # React contexts
│   │   ├── styles/       # CSS files
│   │   └── utils/        # Helper functions
│   └── public/           # Static files
│
└── backend/              # Express + MongoDB
    ├── routes/           # API endpoints
    ├── models/           # Database schemas
    ├── middleware/       # Express middleware
    └── config/           # Configuration files
```

---

## 🚀 Deployment (When Ready)

### Frontend (Vercel - Recommended):
```bash
cd frontend
npm run build
vercel deploy
```

### Backend (Railway/Render):
```bash
cd backend
# Follow Railway/Render deployment guides
# Set environment variables in their dashboard
```

**Important:** Update CORS settings after deployment!

---

## ✅ You're All Set!

Your G-Network app is now running! 

**Development URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Backend Health: http://localhost:5000/health

**Need Help?**
- Check `ERROR_FIXES.md` for detailed troubleshooting
- Look at browser console (F12) for errors
- Check backend terminal for error messages

---

**Happy Coding! 🎉**
