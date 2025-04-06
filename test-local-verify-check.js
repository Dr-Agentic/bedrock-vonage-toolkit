require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Configuration
const LOCAL_API_URL = 'http://localhost:3000';

// Get command line arguments
const args = process.argv.slice(2);
let requestId, code;

if (args.length === 2) {
  // If both requestId and code are provided as arguments
  requestId = args[0];
  code = args[1];
} else if (args.length === 1) {
  // If only code is provided, try to get requestId from file
  code = args[0];
  try {
    requestId = fs.readFileSync('last-request-id.txt', 'utf8').trim();
    console.log(`Using request ID from file: ${requestId}`);
  } catch (error) {
    console.error('Error reading request ID from file. Please provide both request ID and code.');
    console.error('Usage: node test-local-verify-check.js <requestId> <code>');
    process.exit(1);
  }
} else {
  console.error('Usage: node test-local-verify-check.js <requestId> <code>');
  console.error('Or: node test-local-verify-check.js <code> (if last-request-id.txt exists)');
  process.exit(1);
}

// Test function to check verification code
async function testCheckVerification(requestId, code) {
  try {
    console.log('=== TESTING LOCAL SERVERLESS VERIFY CHECK API ===');
    console.log(`Checking verification code for request ID: ${requestId}`);
    console.log(`Code: ${code}`);
    
    // Check verification code
    console.log('\nSending request to local serverless endpoint...');
    const response = await axios.post(`${LOCAL_API_URL}/check-verification`, {
      requestId: requestId,
      code: code
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.status === '0') {
      console.log('\n✅ Verification successful!');
    } else {
      console.log('\n❌ Verification failed!');
    }
    
    return response.data;
  } catch (error) {
    console.error('\n❌ Error testing local verify check API:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Run the test
testCheckVerification(requestId, code).catch(console.error);
