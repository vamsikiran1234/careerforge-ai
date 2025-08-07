const { default: fetch } = require('node-fetch');

async function testChat() {
  try {
    // First login to get token
    const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'vamsikiran198@gmail.com',
        password: 'Password123!'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.error('Login failed');
      return;
    }

    const token = loginData.data.token;

    // Now test chat
    const chatResponse = await fetch('http://localhost:3000/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: 'Hello, I need career guidance!'
      })
    });

    const chatData = await chatResponse.json();
    console.log('Chat response:', chatData);

  } catch (error) {
    console.error('Error testing chat:', error);
  }
}

testChat();
