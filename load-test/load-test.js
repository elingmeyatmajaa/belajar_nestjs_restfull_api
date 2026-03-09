import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '20s', target: 30 },
        { duration: '30s', target: 50 },
        { duration: '10s', target: 20 },
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.05'],
    },
};

export default function () {
    const baseUrl = 'http://localhost:3000/api/users';

    // 1️⃣ Register
    const username = `user${__VU}_${Math.floor(Math.random()*10000)}`;
    const registerPayload = JSON.stringify({
        username,
        password: 'password123',
        name: 'Test User'
    });
    const registerRes = http.post(baseUrl, registerPayload, { headers: { 'Content-Type': 'application/json' } });
    check(registerRes, { 'register 200 or 400': r => r.status === 200 || r.status === 400 });

    // 2️⃣ Login
    const loginPayload = JSON.stringify({ username, password: 'password123' });
    const loginRes = http.post(`${baseUrl}/login`, loginPayload, { headers: { 'Content-Type': 'application/json' } });
    check(loginRes, { 'login 200': r => r.status === 200 });
    const token = loginRes.json('data.token');

    const authHeader = { headers: { 'Authorization': `Bearer ${token}` } };

    // 3️⃣ Get current user
    const getRes = http.get(`${baseUrl}/current`, authHeader);
    check(getRes, { 'get current 200': r => r.status === 200 });

    // 4️⃣ Update user
    const updatePayload = JSON.stringify({ name: 'Updated User' });
    const patchRes = http.patch(`${baseUrl}/current`, updatePayload, { ...authHeader, headers: { ...authHeader.headers, 'Content-Type': 'application/json' } });
    check(patchRes, { 'update 200': r => r.status === 200 });

    // 5️⃣ Logout
    const logoutRes = http.del(`${baseUrl}/current`, null, authHeader);
    check(logoutRes, { 'logout 200': r => r.status === 200 });

    sleep(1);
}