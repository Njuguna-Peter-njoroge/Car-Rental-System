const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';

// Test data
const testVehicle = {
  model: "Toyota Corolla",
  year: 2022,
  licensePlate: "ABC123",
  vin: "1HGCM82633A004352",
  category: "Sedan",
  transmission: "Automatic",
  fuelType: "Gasoline",
  seats: 5,
  dailyRate: 50,
  hourlyRate: 10,
  isAvailable: true,
  location: "New York",
  features: ["AC", "Bluetooth", "Backup Camera"],
  images: ["https://example.com/car1.jpg", "https://example.com/car2.jpg"],
  description: "A comfortable and reliable sedan perfect for daily commuting",
  mileage: 10000,
  status: "ACTIVE"
};

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    authToken = response.data.data.access_token;
    console.log('✅ Login successful');
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testCreateVehicle() {
  try {
    console.log('\n🚗 Creating vehicle...');
    const response = await axios.post(`${BASE_URL}/vehicles`, testVehicle, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Vehicle created:', response.data.data.id);
    return response.data.data.id;
  } catch (error) {
    console.error('❌ Create vehicle failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetAllVehicles() {
  try {
    console.log('\n📋 Getting all vehicles...');
    const response = await axios.get(`${BASE_URL}/vehicles`);
    console.log(`✅ Found ${response.data.data.vehicles.length} vehicles`);
    return response.data.data.vehicles;
  } catch (error) {
    console.error('❌ Get vehicles failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetVehicleById(vehicleId) {
  try {
    console.log(`\n🔍 Getting vehicle ${vehicleId}...`);
    const response = await axios.get(`${BASE_URL}/vehicles/${vehicleId}`);
    console.log('✅ Vehicle details:', response.data.data.model);
    return response.data.data;
  } catch (error) {
    console.error('❌ Get vehicle failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testSearchVehicles() {
  try {
    console.log('\n🔎 Searching vehicles...');
    const response = await axios.get(`${BASE_URL}/vehicles/search?query=Toyota`);
    console.log(`✅ Search results: ${response.data.data.vehicles.length} vehicles found`);
    return response.data.data.vehicles;
  } catch (error) {
    console.error('❌ Search failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testUpdateVehicle(vehicleId) {
  try {
    console.log(`\n✏️ Updating vehicle ${vehicleId}...`);
    const updateData = {
      dailyRate: 55,
      description: "Updated description - now with premium features"
    };
    const response = await axios.patch(`${BASE_URL}/vehicles/${vehicleId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Vehicle updated:', response.data.data.dailyRate);
    return response.data.data;
  } catch (error) {
    console.error('❌ Update failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testCreateReview(vehicleId) {
  try {
    console.log(`\n⭐ Creating review for vehicle ${vehicleId}...`);
    const reviewData = {
      rating: 4,
      comment: "Great car, very comfortable and fuel efficient!"
    };
    const response = await axios.post(`${BASE_URL}/vehicles/${vehicleId}/reviews`, reviewData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Review created');
    return response.data.data;
  } catch (error) {
    console.error('❌ Create review failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetVehicleReviews(vehicleId) {
  try {
    console.log(`\n📝 Getting reviews for vehicle ${vehicleId}...`);
    const response = await axios.get(`${BASE_URL}/vehicles/${vehicleId}/reviews`);
    console.log(`✅ Found ${response.data.data.reviews.length} reviews`);
    return response.data.data.reviews;
  } catch (error) {
    console.error('❌ Get reviews failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testDeleteVehicle(vehicleId) {
  try {
    console.log(`\n🗑️ Deleting vehicle ${vehicleId}...`);
    await axios.delete(`${BASE_URL}/vehicles/${vehicleId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Vehicle deleted');
  } catch (error) {
    console.error('❌ Delete failed:', error.response?.data || error.message);
    throw error;
  }
}

async function runTests() {
  try {
    console.log('🚀 Starting Vehicle API Tests...\n');
    
    // Login first
    await login();
    
    // Test all endpoints
    await testGetAllVehicles();
    await testSearchVehicles();
    
    // Create a vehicle for testing
    const vehicleId = await testCreateVehicle();
    
    // Test with the created vehicle
    await testGetVehicleById(vehicleId);
    await testUpdateVehicle(vehicleId);
    await testCreateReview(vehicleId);
    await testGetVehicleReviews(vehicleId);
    
    // Clean up - delete the test vehicle
    await testDeleteVehicle(vehicleId);
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests(); 