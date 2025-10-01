// Simple test to verify frontend can communicate with backend
import axios from 'axios';

const testHealthEndpoint = async () => {
  try {
    console.log('Testing backend health endpoint...');
    const response = await axios.get('https://backend-api-morphvm-wz7xxc7v.http.cloud.morph.so/health');
    console.log('✅ Backend health check successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Also test the /api/system/info endpoint
    console.log('\nTesting /api/system/info endpoint...');
    const sysResponse = await axios.get('https://backend-api-morphvm-wz7xxc7v.http.cloud.morph.so/api/system/info');
    console.log('✅ System info endpoint successful!');
    console.log('Response:', JSON.stringify(sysResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to backend:');
    console.error(error.message);
    return false;
  }
};

testHealthEndpoint();
