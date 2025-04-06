require('dotenv').config();
const axios = require('axios');

// Configuration
const LOCAL_API_URL = 'http://localhost:3000';
const PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '+1234567890'; // Replace with your test phone number
const BRAND_NAME = 'BedrockTest';

// Test function to request verification
async function testRequestVerification() {
  try {
    console.log('=== TESTING LOCAL SERVERLESS VERIFY API ===');
    console.log(`Requesting verification for phone number: ${PHONE_NUMBER}`);
    
    // Request verification
    console.log('\nSending request to local serverless endpoint...');
    const response = await axios.post(`${LOCAL_API_URL}/request-verification`, {
      number: PHONE_NUMBER,
      brand: BRAND_NAME
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.requestId) {
      console.log('\n✅ Verification request successful!');
      console.log(`Request ID: ${response.data.requestId}`);
      console.log('\nUse this request ID to check the verification code:');
      console.log(`node test-local-verify-check.js ${response.data.requestId} <code>`);
      
      // Save request ID to a file for later use
      require('fs').writeFileSync('last-request-id.txt', response.data.requestId);
      console.log('\nRequest ID saved to last-request-id.txt');
    } else {
      console.log('\n❌ Verification request failed!');
    }
    
    return response.data;
  } catch (error) {
    console.error('\n❌ Error testing local verify API:');
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
testRequestVerification().catch(console.error);
