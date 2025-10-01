/**
 * Backend Verification Test Script
 * Tests all critical backend functionality
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();
const API_URL = 'https://backend-api-morphvm-wz7xxc7v.http.cloud.morph.so';

async function runTests() {
  console.log('🔍 BACKEND VERIFICATION TESTS\n');
  console.log('=' .repeat(50));
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Test 1: Database Connection
  console.log('\n✓ Test 1: Database Connection');
  try {
    await prisma.$connect();
    console.log('  ✅ Database connected successfully');
    passedTests++;
  } catch (error) {
    console.log('  ❌ Database connection failed:', error.message);
  }
  totalTests++;
  
  // Test 2: Database Schema
  console.log('\n✓ Test 2: Database Schema Verification');
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log(`  ✅ Found ${tables.length} tables in database`);
    passedTests++;
  } catch (error) {
    console.log('  ❌ Schema verification failed:', error.message);
  }
  totalTests++;
  
  // Test 3: Data Integrity
  console.log('\n✓ Test 3: Data Integrity Check');
  try {
    const userCount = await prisma.user.count();
    const hospitalCount = await prisma.hospital.count();
    const patientCount = await prisma.patient.count();
    
    console.log(`  ✅ Users: ${userCount}`);
    console.log(`  ✅ Hospitals: ${hospitalCount}`);
    console.log(`  ✅ Patients: ${patientCount}`);
    
    if (userCount > 0 && hospitalCount > 0) {
      passedTests++;
    } else {
      throw new Error('No data found');
    }
  } catch (error) {
    console.log('  ❌ Data integrity check failed:', error.message);
  }
  totalTests++;
  
  // Test 4: API Health Check
  console.log('\n✓ Test 4: API Health Check');
  try {
    const response = await axios.get(`${API_URL}/health`);
    if (response.data.status === 'healthy') {
      console.log('  ✅ API is healthy');
      console.log(`     Version: ${response.data.version}`);
      console.log(`     Environment: ${response.data.environment}`);
      passedTests++;
    } else {
      throw new Error('API unhealthy');
    }
  } catch (error) {
    console.log('  ❌ API health check failed:', error.message);
  }
  totalTests++;
  
  // Test 5: Database API Endpoint
  console.log('\n✓ Test 5: Database API Endpoint');
  try {
    const response = await axios.get(`${API_URL}/health/db`);
    if (response.data.status === 'healthy') {
      console.log('  ✅ Database API endpoint working');
      passedTests++;
    } else {
      throw new Error('Database endpoint unhealthy');
    }
  } catch (error) {
    console.log('  ❌ Database API endpoint failed:', error.message);
  }
  totalTests++;
  
  // Test 6: System Info API
  console.log('\n✓ Test 6: System Info API');
  try {
    const response = await axios.get(`${API_URL}/api/system/info`);
    if (response.data.status === 'operational') {
      console.log('  ✅ System info API working');
      console.log(`     Currency: ${response.data.currency}`);
      console.log(`     Country: ${response.data.country}`);
      console.log(`     Timezone: ${response.data.timezone}`);
      passedTests++;
    } else {
      throw new Error('System info API failed');
    }
  } catch (error) {
    console.log('  ❌ System info API failed:', error.message);
  }
  totalTests++;
  
  // Test 7: Authentication Endpoint
  console.log('\n✓ Test 7: Authentication Endpoint');
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@grandpro-hmso.com.ng',
      password: 'Admin@123'
    });
    if (response.data.success) {
      console.log('  ✅ Authentication endpoint working');
      console.log(`     User: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`);
      passedTests++;
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.log('  ❌ Authentication endpoint failed:', error.message);
  }
  totalTests++;
  
  // Test 8: Nigerian Context
  console.log('\n✓ Test 8: Nigerian Context Verification');
  try {
    const hospital = await prisma.hospital.findFirst();
    if (hospital) {
      const isNigerian = hospital.country === 'Nigeria' && 
                        hospital.currency === 'NGN' &&
                        hospital.timezone === 'Africa/Lagos';
      if (isNigerian) {
        console.log('  ✅ Nigerian context properly configured');
        console.log(`     Sample Hospital: ${hospital.name}`);
        console.log(`     Location: ${hospital.city}, ${hospital.state}`);
        passedTests++;
      } else {
        throw new Error('Nigerian context not properly set');
      }
    }
  } catch (error) {
    console.log('  ❌ Nigerian context verification failed:', error.message);
  }
  totalTests++;
  
  // Test 9: Migration Capability
  console.log('\n✓ Test 9: Migration Capability');
  try {
    const migrations = await prisma.$queryRaw`
      SELECT migration_name 
      FROM "_prisma_migrations" 
      WHERE finished_at IS NOT NULL
      ORDER BY finished_at DESC
      LIMIT 5
    `;
    console.log(`  ✅ Found ${migrations.length} applied migrations`);
    if (migrations.length > 0) {
      console.log(`     Latest: ${migrations[0].migration_name}`);
      passedTests++;
    }
  } catch (error) {
    console.log('  ❌ Migration check failed:', error.message);
  }
  totalTests++;
  
  // Final Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 VERIFICATION SUMMARY\n');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n✅ ALL TESTS PASSED! Backend is fully functional.');
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Review the errors above.`);
  }
  
  await prisma.$disconnect();
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
