const BASE_URL = 'http://localhost:3001/api';

async function testAdmissions() {
    console.log('--- Starting Admissions Test ---');

    // 1. Get Program ID (we need one to apply)
    // We'll assume the seed script ran and we can find it via API or just hardcode if we had the ID.
    // But better to fetch it if we had a public programs API.
    // The UI calls /api/programs. Let's try that.

    let programId;
    try {
        const progRes = await fetch(`${BASE_URL}/programs`);
        const progData = await progRes.json();
        if (progData.items && progData.items.length > 0) {
            programId = progData.items[0]._id;
            console.log('Found Program:', progData.items[0].name, programId);
        } else {
            console.error('❌ No programs found via API');
            return;
        }
    } catch (e) {
        console.error('❌ Failed to fetch programs:', e.message);
        return;
    }

    // 2. Submit Application (Public)
    console.log('\n2. Submitting Application...');
    const appData = {
        applicantName: 'John Doe',
        email: `john.doe.${Date.now()}@example.com`,
        phone: '1234567890',
        programId: programId
    };

    try {
        const applyRes = await fetch(`${BASE_URL}/admissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appData)
        });
        const applyResult = await applyRes.json();

        if (applyRes.status === 201) {
            console.log('✅ Application Submitted:', applyResult.item._id);
        } else {
            console.error('❌ Application Failed:', applyRes.status, applyResult);
            return;
        }
    } catch (e) {
        console.error('❌ Submit error:', e.message);
    }

    // 3. Create Admin User & Login (to check list)
    console.log('\n3. Creating Admin & Checking List...');
    const adminEmail = `admin_${Date.now()}@example.com`;
    const adminPass = 'admin123';
    let adminToken;

    // Signup Admin
    await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: adminEmail,
            password: adminPass,
            fullName: 'Admin User',
            roleName: 'ADMIN'
        })
    });

    // Login Admin
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPass })
    });
    const loginData = await loginRes.json();
    if (loginRes.ok) {
        adminToken = loginData.token;
        console.log('Admin Logged In');
    } else {
        console.error('❌ Admin Login Failed');
        return;
    }

    // 4. List Applications (Protected)
    const listRes = await fetch(`${BASE_URL}/admissions`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const listData = await listRes.json();

    if (listRes.ok) {
        console.log(`✅ Admin fetched ${listData.items.length} applications`);
        const found = listData.items.find(i => i.email === appData.email);
        if (found) {
            console.log('✅ Verified: Newly submitted application is in the list');
        } else {
            console.error('❌ Newly submitted application NOT found in list');
        }
    } else {
        console.error('❌ Admin List Failed:', listRes.status, listData);
    }
}

testAdmissions();
