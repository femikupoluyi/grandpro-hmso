// Integration test to verify frontend-backend communication
import axios from 'axios';

console.log('=== Frontend-Backend Integration Test ===\n');

const tests = [
  {
    name: 'Health Check Endpoint',
    url: 'https://backend-api-morphvm-wz7xxc7v.http.cloud.morph.so/health',
    expectedStatus: 200
  },
  {
    name: 'System Info API Endpoint',
    url: 'https://backend-api-morphvm-wz7xxc7v.http.cloud.morph.so/api/system/info',
    expectedStatus: 200
  }
];

async function runTests() {
  let allPassed = true;
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`URL: ${test.url}`);
      
      const response = await axios.get(test.url);
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ PASSED - Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      } else {
        console.log(`❌ FAILED - Expected status ${test.expectedStatus}, got ${response.status}`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ FAILED - ${error.message}`);
      allPassed = false;
    }
    console.log('');
  }
  
  console.log('=== Summary ===');
  if (allPassed) {
    console.log('✅ All tests passed! Frontend can successfully communicate with backend.');
  } else {
    console.log('❌ Some tests failed. Please check the configuration.');
  }
}

runTests();
