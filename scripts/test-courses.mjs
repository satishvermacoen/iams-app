const BASE_URL = 'http://localhost:3001/api';

async function testCourses() {
    console.log('--- Starting Course Management Test ---');

    // 1. Login as Admin
    const adminEmail = `admin_test_${Date.now()}@example.com`;
    const adminPass = 'admin123';
    let adminToken;

    // Signup/Login Admin
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

    // 2. Create Course
    console.log('\n2. Creating Course...');
    const courseCode = `CS${Date.now()}`;
    const courseRes = await fetch(`${BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
            courseCode,
            courseName: 'Intro to CS',
            credits: 4,
            type: 'CORE'
        })
    });
    const courseData = await courseRes.json();
    if (courseRes.status === 201) {
        console.log('✅ Course Created:', courseData.item.courseCode);
    } else {
        console.error('❌ Course Creation Failed:', courseRes.status, courseData);
        return;
    }
    const courseId = courseData.item._id;

    // 3. Create Semester
    // Need a program ID.
    const progRes = await fetch(`${BASE_URL}/programs`);
    const progData = await progRes.json();
    if (!progData.items || progData.items.length === 0) {
        console.error('❌ No programs found');
        return;
    }
    const program = progData.items[0];
    const programId = program._id;
    const departmentId = program.department ? program.department._id : null;

    if (!departmentId) {
        console.error('❌ Program has no department info');
        return;
    }

    console.log('\n3. Creating Semester...');
    const semRes = await fetch(`${BASE_URL}/semesters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
            name: 'Semester 1',
            sequenceNo: 1,
            academicYear: '2025-2026',
            programId
        })
    });
    const semData = await semRes.json();
    if (semRes.status === 201) {
        console.log('✅ Semester Created:', semData.item.name);
    } else {
        console.error('❌ Semester Creation Failed:', semRes.status, semData);
        return;
    }
    const semesterId = semData.item._id;

    // 4. Create Faculty
    console.log('\n4. Creating Faculty User & Profile...');
    const facEmail = `faculty_${Date.now()}@example.com`;
    const facSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: facEmail, password: 'password', fullName: 'Prof. X', roleName: 'FACULTY' })
    });
    const facSignupData = await facSignupRes.json();
    const facUserId = facSignupData.user.id;

    const facProfileRes = await fetch(`${BASE_URL}/admin-faculty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
            userId: facUserId,
            departmentId: departmentId,
            employeeCode: `EMP${Date.now()}`,
            designation: 'Professor'
        })
    });
    const facProfileData = await facProfileRes.json();
    if (facProfileRes.status === 201) {
        console.log('✅ Faculty Profile Created:', facProfileData.item.employeeCode);
    } else {
        console.error('❌ Faculty Profile Creation Failed:', facProfileRes.status, facProfileData);
        return;
    }
    const facultyId = facProfileData.item._id;

    // 5. Create Course Offering
    console.log('\n5. Creating Course Offering...');
    const offerRes = await fetch(`${BASE_URL}/course-offerings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
            courseId,
            semesterId,
            facultyId,
            section: 'A',
            year: '2025-2026',
            maxCapacity: 60
        })
    });
    const offerData = await offerRes.json();
    if (offerRes.status === 201) {
        console.log('✅ Course Offering Created:', offerData.item._id);
    } else {
        console.error('❌ Course Offering Creation Failed:', offerRes.status, offerData);
        return;
    }

    // 6. Verify Student Access
    console.log('\n6. Verifying Student Access...');
    // Create Student
    const stuEmail = `student_${Date.now()}@example.com`;
    await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: stuEmail, password: 'password', fullName: 'Student Y', roleName: 'STUDENT' })
    });
    const stuLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: stuEmail, password: 'password' })
    });
    const stuLoginData = await stuLoginRes.json();
    const stuToken = stuLoginData.token;

    // List Offerings
    const listRes = await fetch(`${BASE_URL}/course-offerings?semesterId=${semesterId}`, {
        headers: { 'Authorization': `Bearer ${stuToken}` }
    });
    const listData = await listRes.json();
    if (listRes.ok) {
        const found = listData.items.find(i => i._id === offerData.item._id);
        if (found) {
            console.log('✅ Student can see the new offering');
        } else {
            console.error('❌ Student CANNOT see the new offering');
        }
    } else {
        console.error('❌ Student List Failed:', listRes.status, listData);
    }
}

testCourses();
