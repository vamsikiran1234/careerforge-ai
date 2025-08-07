const { default: fetch } = require('node-fetch');

async function registerUser() {
  try {
    const response = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Vamsi',
        email: 'vamsikiran198@gmail.com',
        password: 'Password123!'
      })
    });

    const data = await response.json();
    console.log('Registration response:', data);
  } catch (error) {
    console.error('Error registering user:', error);
  }
}

registerUser();
