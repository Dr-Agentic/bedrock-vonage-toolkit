require('dotenv').config();
const Vonage = require('@vonage/server-sdk');

// Phone number to test with
const TEST_PHONE_NUMBER = '+1234567890';
const BRAND_NAME = 'BedRockDemo';

// Initialize Vonage client
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

// Test function to request verification
async function testRequestVerification() {
  return new Promise((resolve, reject) => {
    console.log('=== TESTING VONAGE VERIFY REQUEST ===');
    console.log(`Testing with phone number: ${TEST_PHONE_NUMBER}`);
    
    // Request verification
    console.log('\nRequesting verification code...');
    vonage.verify.request({
      number: TEST_PHONE_NUMBER,
      brand: BRAND_NAME,
      code_length: 4,
      lg: 'en-us'
      // channel parameter is not supported in this version
    }, (err, result) => {
      if (err) {
        console.error('Error requesting verification:', err);
        reject(err);
      } else {
        console.log('Verification requested successfully:');
        console.log(JSON.stringify(result, null, 2));
        console.log('\nRequest ID:', result.request_id);
        console.log('Save this request ID to use when checking the verification code.');
        resolve(result);
      }
    });
  });
}

// Test function to check verification
function testCheckVerification(requestId, code) {
  return new Promise((resolve, reject) => {
    console.log('=== TESTING VONAGE VERIFY CHECK ===');
    console.log(`Checking request ID: ${requestId} with code: ${code}`);
    
    // Check verification code
    console.log('\nChecking verification code...');
    vonage.verify.check({
      request_id: requestId,
      code: code
    }, (err, result) => {
      if (err) {
        console.error('Error checking verification:', err);
        reject(err);
      } else {
        console.log('Verification check result:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.status === '0') {
          console.log('\n✅ Verification successful!');
        } else {
          console.log('\n❌ Verification failed!');
        }
        resolve(result);
      }
    });
  });
}

// Test function to cancel verification
function testCancelVerification(requestId) {
  return new Promise((resolve, reject) => {
    console.log('=== TESTING VONAGE VERIFY CANCEL ===');
    console.log(`Cancelling request ID: ${requestId}`);
    
    // Cancel verification request
    console.log('\nCancelling verification request...');
    vonage.verify.control({
      request_id: requestId,
      cmd: 'cancel'
    }, (err, result) => {
      if (err) {
        console.error('Error cancelling verification:', err);
        reject(err);
      } else {
        console.log('Verification cancel result:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.status === '0') {
          console.log('\n✅ Verification cancelled successfully!');
        } else {
          console.log('\n❌ Verification cancellation failed!');
        }
        resolve(result);
      }
    });
  });
}

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'request';

if (command === 'request') {
  testRequestVerification().catch(console.error);
} else if (command === 'check') {
  if (args.length !== 3) {
    console.error('Usage: node test-verify-direct.js check <requestId> <code>');
    process.exit(1);
  }
  testCheckVerification(args[1], args[2]).catch(console.error);
} else if (command === 'cancel') {
  if (args.length !== 2) {
    console.error('Usage: node test-verify-direct.js cancel <requestId>');
    process.exit(1);
  }
  testCancelVerification(args[1]).catch(console.error);
} else {
  console.error('Unknown command. Use "request", "check", or "cancel"');
  process.exit(1);
}
