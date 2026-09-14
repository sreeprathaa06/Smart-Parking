const API_URL = 'http://localhost:5000/api';

let userToken = '';
let adminToken = '';
let parkingId = '';
let bookingId = '';

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, data };
  return data;
};

const testRunner = async () => {
  console.log('--- STARTING TESTS ---');
  let testsPassed = 0;
  let testsFailed = 0;

  const assert = (condition, successMsg, failMsg) => {
    if (condition) {
      console.log('✅ ' + successMsg);
      testsPassed++;
    } else {
      console.log('❌ ' + failMsg);
      testsFailed++;
    }
  };

  try {
    // 1. AUTHENTICATION
    console.log('\n--- 1. Testing Authentication ---');
    
    const userEmail = `user${Date.now()}@test.com`;
    const userRes = await fetchJson(`${API_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Test User', email: userEmail, password: 'password123' })
    });
    assert(userRes.success, 'User registered successfully', 'User registration failed');
    userToken = userRes.data.token;

    try {
      await fetchJson(`${API_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ name: 'Test User 2', email: userEmail, password: 'password123' })
      });
      assert(false, '', 'Duplicate registration should have failed');
    } catch (err) {
      assert(err.status === 400, 'Duplicate registration failed as expected (400)', 'Duplicate registration failed with wrong status');
    }

    const adminEmail = `admin${Date.now()}@test.com`;
    const adminRes = await fetchJson(`${API_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Admin User', email: adminEmail, password: 'password123', role: 'admin' })
    });
    assert(adminRes.data.role === 'admin', 'Admin registered with role admin', 'Admin registration failed to set role');
    adminToken = adminRes.data.token;

    // 2. PARKING & SECURITY
    console.log('\n--- 2. Testing Parking & Security ---');
    
    const parkingData = {
      name: 'Test Parking ' + Date.now(),
      location: '123 Test St',
      totalSlots: 10,
      pricePerHour: 5,
      openingTime: '08:00',
      closingTime: '20:00'
    };

    try {
      await fetchJson(`${API_URL}/parking`, {
        method: 'POST',
        body: JSON.stringify(parkingData),
        headers: { Authorization: `Bearer ${userToken}` }
      });
      assert(false, '', 'Normal user should not be able to create parking');
    } catch (err) {
      assert(err.status === 403 || err.status === 401, 'Normal user blocked from creating parking', 'Normal user blocked with wrong status');
    }

    const createParkingRes = await fetchJson(`${API_URL}/parking`, {
      method: 'POST',
      body: JSON.stringify(parkingData),
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(createParkingRes.success, 'Admin created parking successfully', 'Admin failed to create parking');
    parkingId = createParkingRes.data._id;

    // 3. BOOKING
    console.log('\n--- 3. Testing Booking ---');
    
    const bookingData = {
      parkingId: parkingId,
      bookingDate: new Date().toISOString(),
      startTime: '10:00',
      endTime: '12:00'
    };

    const bookRes = await fetchJson(`${API_URL}/bookings`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(bookRes.success, 'User created booking successfully', 'User failed to create booking');
    bookingId = bookRes.data._id;

    const getParkingRes = await fetchJson(`${API_URL}/parking/${parkingId}`);
    assert(getParkingRes.data.availableSlots === 9, 'Available slots decreased correctly', `Available slots did not decrease correctly! Found: ${getParkingRes.data.availableSlots}`);

    // Try booking again 9 more times to fill it up
    for(let i=0; i<9; i++) {
      await fetchJson(`${API_URL}/bookings`, {
        method: 'POST',
        body: JSON.stringify(bookingData),
        headers: { Authorization: `Bearer ${userToken}` }
      });
    }

    try {
      await fetchJson(`${API_URL}/bookings`, {
        method: 'POST',
        body: JSON.stringify(bookingData),
        headers: { Authorization: `Bearer ${userToken}` }
      });
      assert(false, '', 'Booking should have failed when full');
    } catch(err) {
      assert(err.status === 400, 'Booking failed when parking is full', 'Booking failed with wrong status when full');
    }

    await fetchJson(`${API_URL}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(true, 'User cancelled booking successfully', '');

    const getParkingResAfterCancel = await fetchJson(`${API_URL}/parking/${parkingId}`);
    assert(getParkingResAfterCancel.data.availableSlots === 1, 'Available slots increased correctly after cancellation', `Available slots did not increase correctly! Found: ${getParkingResAfterCancel.data.availableSlots}`);

  } catch (err) {
    console.error('❌ Test failed unexpectedly:', err.data || err.message || err);
  } finally {
    console.log(`\n--- TESTS FINISHED: ${testsPassed} Passed, ${testsFailed} Failed ---`);
    process.exit(testsFailed > 0 ? 1 : 0);
  }
};

testRunner();
