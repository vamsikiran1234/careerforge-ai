const password = 'Naga$93525';
const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

console.log('Testing password:', password);
console.log('Length:', password.length);
console.log('Has lowercase:', /[a-z]/.test(password));
console.log('Has uppercase:', /[A-Z]/.test(password));
console.log('Has digit:', /\d/.test(password));
console.log('Has special [@$!%*?&]:', /[@$!%*?&]/.test(password));
console.log('Only allowed chars:', /^[A-Za-z\d@$!%*?&]+$/.test(password));
console.log('\n✅ FULL REGEX MATCH:', regex.test(password));

// Test with your other password too
const password2 = 'Vamsi$93525';
console.log('\n--- Testing second password ---');
console.log('Testing password:', password2);
console.log('✅ FULL REGEX MATCH:', regex.test(password2));
