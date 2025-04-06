require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Configuration
const LOCAL_API_URL = 'http://localhost:3000';

// Get command line arguments
const args = process.argv.slice(2);
let requestId;

if (args.length === 1) {
  // If requestId is provided as argument
  requestId = args[0];
} else {
  // Try to get requestId from file
  try {
    requestId = fs.readFileSync('last-request-id.txt', 'utf8').trim();
    console.log(`Using request ID from file: ${requestId}`);
  } catch (error) {
    console.error('Error reading request ID from file. Please provide a request ID.');
    console.error('Usage: node test-local-verify-cancel.js <requestId>');
    process.exit(1);
  }
}

// Test function to cancel verification
async function testCancelVerification(requestId) {
  try {
    console.log('=== TESTING LOCAL SERVERLESS VERIFY CANCEL API ===');
    console.log(`Cancelling verification for request ID: ${requestId}`);
    
    // Cancel verification
    console.log('\nSending request to local serverless endpoint...');
    const response = await axios.post(`${LOCAL_API_URL}/cancel-verification`, {
      requestId: requestId
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.status === '0') {
      console.log('\n✅ Verification cancellation successful!');
    } else {
      console.log('\n❌ Verification cancellation failed!');
    }
    
    return response.data;
  } catch (error) {
    console.error('\n❌ Error testing local verify cancel API:');
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
testCancelVerification(requestId).catch(console.error);
