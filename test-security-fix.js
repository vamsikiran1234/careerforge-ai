// Test script to verify the backend security fix
const testMessage = "I want to create a new database for my project and select the best career path.";

console.log('Testing message with SQL keywords:', testMessage);
console.log('Length:', testMessage.length);
console.log('This should now work without triggering the security middleware');