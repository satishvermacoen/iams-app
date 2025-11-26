// const fetch = require('node-fetch'); // Native fetch used

const BASE_URL = 'http://localhost:3001/api/auth';

async function testAuth() {
    console.log('--- Starting Auth Test ---');

    // 1. Test Signup
    const email = `test_user_${Date.now()}@example.com`;
    const password = 'password123';
    const fullName = 'Test User';

    console.log(`\n1. Testing Signup for ${email}...`);
    try {
        const signupRes = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, fullName, roleName: 'STUDENT' })
        });

        const signupData = await signupRes.json();

        if (signupRes.status === 201) {
            console.log('✅ Signup Successful');
            console.log('User ID:', signupData.user.id);
        } else {
            console.error('❌ Signup Failed:', signupRes.status, signupData);
            return;
        }

        // 2. Test Login
        console.log(`\n2. Testing Login for ${email}...`);
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const loginData = await loginRes.json();

        if (loginRes.status === 200) {
            console.log('✅ Login Successful');
            console.log('Token received:', !!loginData.token);
        } else {
            console.error('❌ Login Failed:', loginRes.status, loginData);
        }

    } catch (error) {
        console.error('❌ Test Error:', error.message);
    }
}

testAuth();
