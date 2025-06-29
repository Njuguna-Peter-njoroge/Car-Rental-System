const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5YjkzYzkxMy05YmVmLTQzMWMtOTBmYy1lNmI5Zjc3YjNiMjUiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzUxMTk0NzUyLCJleHAiOjE3NTEyODExNTJ9.P8brX8oJVungNtIiDGb7bENEoct4D7EC-OowaXMC-WM';
const VEHICLE_ID = 'b9290c0e-c4e5-4741-bab8-c5f11b7c16e7';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${AUTH_TOKEN}`
};

async function testBookings() {
  try {
    console.log('🚗 Testing Booking & Reservation API...\n');

    // 1. Create a booking
    console.log('1. Creating a new booking...');
    const createResponse = await axios.post(`${BASE_URL}/bookings`, {
      vehicleId: VEHICLE_ID,
      startDate: '2025-07-01T10:00:00.000Z',
      endDate: '2025-07-03T18:00:00.000Z',
      pickupLocation: 'New York Airport',
      returnLocation: 'New York Downtown',
      notes: 'Test booking for API testing'
    }, { headers });

    console.log('✅ Booking created:', createResponse.data);
    const bookingId = createResponse.data.id;

    // 2. Get all bookings
    console.log('\n2. Getting all bookings...');
    const getAllResponse = await axios.get(`${BASE_URL}/bookings`, { headers });
    console.log('✅ All bookings:', getAllResponse.data);

    // 3. Get my bookings
    console.log('\n3. Getting my bookings...');
    const getMyResponse = await axios.get(`${BASE_URL}/bookings/me`, { headers });
    console.log('✅ My bookings:', getMyResponse.data);

    // 4. Get specific booking
    console.log('\n4. Getting specific booking...');
    const getOneResponse = await axios.get(`${BASE_URL}/bookings/${bookingId}`, { headers });
    console.log('✅ Specific booking:', getOneResponse.data);

    // 5. Update booking
    console.log('\n5. Updating booking...');
    const updateResponse = await axios.patch(`${BASE_URL}/bookings/${bookingId}`, {
      pickupLocation: 'Updated Location',
      notes: 'Updated notes for testing'
    }, { headers });
    console.log('✅ Booking updated:', updateResponse.data);

    // 6. Search bookings with filters
    console.log('\n6. Searching bookings with filters...');
    const searchResponse = await axios.get(`${BASE_URL}/bookings?status=PENDING&page=1&limit=5`, { headers });
    console.log('✅ Search results:', searchResponse.data);

    // 7. Cancel booking
    console.log('\n7. Cancelling booking...');
    const cancelResponse = await axios.delete(`${BASE_URL}/bookings/${bookingId}`, { headers });
    console.log('✅ Booking cancelled:', cancelResponse.data);

    console.log('\n🎉 All booking tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing bookings:', error.response?.data || error.message);
  }
}

// Run the tests
testBookings(); 