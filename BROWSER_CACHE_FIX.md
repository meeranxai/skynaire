# ⚠️ BROWSER CACHE ISSUE - QUICK FIX

## The Problem
Your browser cached the old manifest.json with missing icon files. This is causing:
1. Icon errors (144x144.png not found)
2. Possible GlobalSearch loading issues

## The Solution - Hard Refresh

### Windows/Linux:
```
Press: Ctrl + Shift + R
OR
Press: Ctrl + F5
```

### Mac:
```
Press: Cmd + Shift + R
```

### Or via DevTools:
1. Press F12 to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Close DevTools

## After Hard Refresh:

✅ Icon errors should disappear (now using vite.svg)
✅ GlobalSearch should work (press Ctrl+K)
✅ No more 500 errors

## Verification:

1. Open browser console (F12)
2. Go to Application tab → Manifest
3. You should see icons pointing to /vite.svg (not /images/icon-*.png)

---

**If errors persist after hard refresh, restart the frontend dev server:**
```bash
# Stop: Ctrl+C in the frontend terminal
# Restart: npm run dev
```
