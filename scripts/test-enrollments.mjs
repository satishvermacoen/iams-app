const BASE_URL = 'http://localhost:3001/api';

async function testEnrollments() {
    console.log('--- Starting Enrollment Test ---');

    // 1. Login as Admin
    const adminEmail = `admin_test_${Date.now()}@example.com`;
    const adminPass = 'admin123';
    let adminToken;

    await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPass, fullName: 'Admin User', roleName: 'ADMIN' })
    });
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPass })
    });
    const loginData = await loginRes.json();
    adminToken = loginData.token;
    console.log('✅ Admin Logged In');

    // 2. Fetch Program and Semester (Assuming they exist from previous tests)
    const progRes = await fetch(`${BASE_URL}/programs`);
    const progData = await progRes.json();
    if (!progData.items || progData.items.length === 0) {
        console.error('❌ No programs found');
        return;
    }
    const programId = progData.items[0]._id;

    const semRes = await fetch(`${BASE_URL}/semesters?programId=${programId}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const semData = await semRes.json();
    if (!semData.items || semData.items.length === 0) {
        console.error('❌ No semesters found');
        return;
    }
    const semesterId = semData.items[0]._id;

    // 3. Create Student (User + Profile)
    console.log('\n3. Creating Student...');
    const stuEmail = `student_enroll_${Date.now()}@example.com`;
    const stuPass = 'student123';
    const createStuRes = await fetch(`${BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
            fullName: 'Enrollment Tester',
            email: stuEmail,
            password: stuPass,
            programId,
            semesterId,
            enrollmentNo: `ENR${Date.now()}`
        })
    });
    const createStuData = await createStuRes.json();
    if (createStuRes.status === 201) {
        console.log('✅ Student Created:', createStuData.item.enrollmentNo);
    } else {
        console.error('❌ Student Creation Failed:', createStuRes.status, createStuData);
        return;
    }

    // 4. Login as Student
    console.log('\n4. Logging in as Student...');
    const stuLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: stuEmail, password: stuPass })
    });
    const stuLoginData = await stuLoginRes.json();
    const stuToken = stuLoginData.token;
    if (stuToken) {
        console.log('✅ Student Logged In');
    } else {
        console.error('❌ Student Login Failed');
        return;
    }

    // 5. Find an Offering to Enroll
    const offerRes = await fetch(`${BASE_URL}/course-offerings?semesterId=${semesterId}`, {
        headers: { 'Authorization': `Bearer ${stuToken}` }
    });
    const offerData = await offerRes.json();
    if (!offerData.items || offerData.items.length === 0) {
        console.error('❌ No course offerings found');
        return;
    }
    const offeringId = offerData.items[0]._id;
    console.log('Found Offering:', offerData.items[0].course.courseCode);

    // 6. Enroll
    console.log('\n6. Enrolling...');
    const enrollRes = await fetch(`${BASE_URL}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${stuToken}` },
        body: JSON.stringify({ offeringId })
    });
    const enrollData = await enrollRes.json();
    if (enrollRes.status === 201) {
        console.log('✅ Enrolled Successfully:', enrollData.item._id);
    } else {
        console.error('❌ Enrollment Failed:', enrollRes.status, enrollData);
        return;
    }

    // 7. Verify Enrollment List
    console.log('\n7. Verifying Enrollment List...');
    const myEnrollRes = await fetch(`${BASE_URL}/enrollments`, {
        headers: { 'Authorization': `Bearer ${stuToken}` }
    });
    const myEnrollData = await myEnrollRes.json();
    const found = myEnrollData.enrollments.find(e => e.offering._id === offeringId);
    if (found) {
        console.log('✅ Enrollment verified in list');
    } else {
        console.error('❌ Enrollment NOT found in list');
    }
}

testEnrollments();
