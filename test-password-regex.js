// Test the password validation regex
const password = 'Vamsi$93525';
const oldRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
const newRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

console.log('Testing password:', password);
console.log('Old regex (broken):', oldRegex.toString());
console.log('New regex (fixed):', newRegex.toString());

console.log('\nOld regex test:', oldRegex.test(password));
console.log('New regex test:', newRegex.test(password));

// Test with a password that should fail
const badPassword = 'Vamsi$93525#';  // Contains # which is not allowed
console.log('\nTesting bad password:', badPassword);
console.log('Old regex test (bad):', oldRegex.test(badPassword));
console.log('New regex test (bad):', newRegex.test(badPassword));

console.log('\nPassword validation test completed.');