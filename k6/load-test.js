import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 options defining simulation stages and thresholds
export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp up to 50 users
    { duration: '20s', target: 100 }, // Ramp up to 100 users for peak load
    { duration: '15s', target: 100 }, // Steady state with 100 concurrent users
    { duration: '10s', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    // Assertions: 95% of request durations must be under 800ms
    http_req_duration: ['p(95)<800'],
    // Request error rate must be below 1%
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Use unique emails and names per virtual user (VU)
  const vuId = __VU;
  const iteration = __ITER;
  const email = `loadtest-user-${vuId}-${iteration}@example.com`;
  const name = `LoadTest User ${vuId} Iteration ${iteration}`;

  // 1. Authenticate / Obtain JWT via Dev Bypass
  const bypassUrl = `${BASE_URL}/auth/bypass?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;
  const authRes = http.get(bypassUrl);
  
  const authOk = check(authRes, {
    'auth response is 200': (r) => r.status === 200,
    'has token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.accessToken !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (!authOk) {
    console.error(`Auth failed for user ${email}: Status ${authRes.status}`);
    sleep(1);
    return;
  }

  const token = JSON.parse(authRes.body).accessToken;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // 2. Fetch public events list
  const eventsRes = http.get(`${BASE_URL}/events`, { headers });
  const eventsOk = check(eventsRes, {
    'events fetched successfully': (r) => r.status === 200,
  });

  if (!eventsOk) {
    sleep(1);
    return;
  }

  let eventsData;
  try {
    eventsData = JSON.parse(eventsRes.body).data;
  } catch (e) {
    sleep(1);
    return;
  }

  if (!eventsData || eventsData.length === 0) {
    // No events to register to, wait and try next iteration
    sleep(1);
    return;
  }

  // Find the first event that is 'published'
  const event = eventsData.find(e => e.status === 'published');
  if (!event) {
    console.warn(`[WARNING] No 'published' event found in the catalog. Registration test cannot run. Please create a published event first or run database seeds.`);
    sleep(2);
    return;
  }
  
  const eventId = event.id;

  // 3. Get event details
  const detailRes = http.get(`${BASE_URL}/events/${eventId}`, { headers });
  check(detailRes, {
    'event detail fetched successfully': (r) => r.status === 200,
  });

  // 4. Register to the event
  const regRes = http.post(`${BASE_URL}/events/${eventId}/registrations`, {}, { headers });
  const regOk = check(regRes, {
    'registration status is 201 or 409': (r) => r.status === 201 || r.status === 409,
  });

  if (!regOk) {
    console.warn(`[DEBUG] Registration failed for event ${eventId} and user ${email}. Status: ${regRes.status}, Body: ${regRes.body}`);
  }

  // 5. Unregister (clean up DB to allow test reruns)
  const unregRes = http.del(`${BASE_URL}/events/${eventId}/registrations`, null, { headers });
  check(unregRes, {
    'unregistration status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  // Wait 1 second before starting the next loop
  sleep(1);
}
