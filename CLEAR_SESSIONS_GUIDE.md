# 🧹 Clear Chat Sessions - Complete Guide

## Overview
This guide explains how to clear all cached chat sessions from CareerForge AI.

---

## ✅ What Was Done

### 1. **Backend Cleared** ✅
- All chat sessions deleted from database
- Script created: `scripts/clearSessions.js`
- Run anytime with: `node scripts/clearSessions.js`

### 2. **Frontend Changes** ✅
- Changed session time display from relative time to **∞ Always**
- Fixed template cards to create sessions directly when clicked
- Added `clearAllSessions()` function to chat store

### 3. **Developer Tools Added** ✅
- Global console function: `__clearChatStorage()`
- Clear storage HTML page: `/clear-storage.html`
- Store method: `useChatStore().clearAllSessions()`

---

## 🚀 How to Clear Frontend Cache

### **Method 1: Browser Console** (⭐ Easiest & Fastest)

1. Open browser DevTools: **Press F12**
2. Go to **Console** tab
3. Run this command:
   ```javascript
   __clearChatStorage()
   ```
   Or:
   ```javascript
   localStorage.removeItem('chat-storage'); location.reload();
   ```

### **Method 2: Clear Storage Page**

1. Navigate to: **http://localhost:5173/clear-storage.html**
2. Click **"Clear Chat Sessions Only"**
3. Close tab and refresh the main app

### **Method 3: Application Storage** (Manual)

1. Open DevTools: **F12**
2. Go to **Application** tab
3. Click **Local Storage** → **http://localhost:5173**
4. Find and delete **"chat-storage"**
5. Refresh the page

### **Method 4: React DevTools**

1. Install React DevTools extension
2. Open Components tab
3. Find `useChatStore` hook
4. Call `clearAllSessions()` method

---

## 📋 What Gets Cleared

### Chat Sessions Only:
- ✅ All chat history
- ✅ All messages
- ✅ All conversations
- ❌ Login remains (you stay logged in)

### Full Reset:
- ✅ All chat history
- ✅ Login credentials
- ✅ All localStorage data
- ⚠️ You'll need to log in again

---

## 🔧 For Developers

### Backend: Clear Database
```bash
cd C:\Users\vamsi\careerforge-ai
node scripts\clearSessions.js
```

### Frontend: Programmatic Clear
```typescript
import { useChatStore } from '@/store/chat';

// Inside component
const { clearAllSessions } = useChatStore();
clearAllSessions();
```

### Clear Everything (Reset App)
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 🎯 Quick Reference

| What to Clear | Command |
|---------------|---------|
| Chat only | `__clearChatStorage()` |
| Chat only (manual) | `localStorage.removeItem('chat-storage')` |
| Everything | `localStorage.clear()` |
| Backend DB | `node scripts\clearSessions.js` |

---

## 💡 Tips

- The `__clearChatStorage()` function is available globally after the app loads
- You can open the console at any time and run it
- The function automatically reloads the page after clearing
- Your login will persist unless you do a full reset

---

## 🐛 Troubleshooting

### Sessions Still Showing After Clear?
1. Make sure you refreshed the page (**F5** or **Ctrl+R**)
2. Try a hard refresh: **Ctrl+Shift+R**
3. Clear browser cache if needed

### Can't Find Console Function?
- Make sure the app has loaded completely
- Check the console for the welcome message
- Try refreshing the page

### Want to Start Completely Fresh?
1. Run `__clearChatStorage()` in console
2. Run `node scripts\clearSessions.js` in terminal
3. Hard refresh the browser (**Ctrl+Shift+R**)

---

## 📝 Summary

**All tasks completed:**
1. ✅ Cleared all previous chat sessions from database
2. ✅ Changed session time to show "∞ Always"
3. ✅ Fixed template cards to create sessions directly
4. ✅ Added frontend clearing functions

**To start fresh:**
1. Open console: **F12**
2. Run: `__clearChatStorage()`
3. Done! Enjoy your clean slate 🎉
