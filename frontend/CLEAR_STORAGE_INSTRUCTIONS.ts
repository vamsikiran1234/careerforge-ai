/**
 * Clear Frontend Chat Storage
 * 
 * Quick instructions to clear all cached chat sessions:
 * 
 * METHOD 1: Browser Console (Easiest)
 * ====================================
 * 1. Open browser DevTools (Press F12)
 * 2. Go to Console tab
 * 3. Run this command:
 *    localStorage.removeItem('chat-storage'); location.reload();
 * 
 * METHOD 2: Clear Storage Page
 * ============================
 * 1. Navigate to: http://localhost:5173/clear-storage.html
 * 2. Click "Clear Chat Sessions Only"
 * 3. Refresh the main app
 * 
 * METHOD 3: Application Storage (Manual)
 * ======================================
 * 1. Open DevTools (F12)
 * 2. Go to "Application" tab
 * 3. Click "Local Storage" → "http://localhost:5173"
 * 4. Find and delete "chat-storage"
 * 5. Refresh the page
 * 
 * METHOD 4: Use Store Function
 * ============================
 * 1. Open Console (F12)
 * 2. Run: 
 *    window.__clearChatStorage()
 * 
 */

// Global function to clear chat storage
if (typeof window !== 'undefined') {
  interface WindowWithDevTools extends Window {
    __clearChatStorage?: () => void;
  }
  (window as WindowWithDevTools).__clearChatStorage = () => {
    localStorage.removeItem('chat-storage');
    console.log('✅ Chat storage cleared!');
    console.log('🔄 Reloading page...');
    window.location.reload();
  };
  
  console.log('💡 CareerForge AI - Quick Clear Commands:');
  console.log('   Run: __clearChatStorage()  - to clear all chat data');
  console.log('   Or:  localStorage.removeItem("chat-storage"); location.reload();');
}

export {};
