// Clear All Frontend Storage Script
// This script clears all cached chat sessions from localStorage

console.log('🧹 Clearing all frontend cached chat sessions...');

try {
  // Clear Zustand chat storage
  if (localStorage.getItem('chat-storage')) {
    localStorage.removeItem('chat-storage');
    console.log('✅ Cleared chat-storage from localStorage');
  }

  // Clear auth storage (but keep user logged in)
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    const authData = JSON.parse(authStorage);
    // Keep user and token, but clear everything else
    const cleanAuthData = {
      state: {
        user: authData.state?.user,
        token: authData.state?.token,
        isAuthenticated: authData.state?.isAuthenticated,
      },
      version: authData.version,
    };
    localStorage.setItem('auth-storage', JSON.stringify(cleanAuthData));
    console.log('✅ Cleaned auth-storage (kept user login)');
  }

  // Clear any other chat-related items
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('session') || key.includes('message') || key.includes('chat'))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Cleared ${key}`);
  });

  console.log('🎉 Frontend storage cleared successfully!');
  console.log('📝 Please refresh the page to see a clean chat interface');
} catch (error) {
  console.error('❌ Error clearing storage:', error);
}

// Export function for use in dev tools
(window as any).clearChatStorage = () => {
  localStorage.removeItem('chat-storage');
  console.log('✅ Chat storage cleared! Refresh the page.');
};

console.log('💡 Tip: You can run clearChatStorage() in the console anytime to clear chat data');
