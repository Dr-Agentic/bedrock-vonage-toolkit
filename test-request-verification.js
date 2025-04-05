require('dotenv').config();
const { VerifyService } = require('./src/services/verifyService');

// Phone number to test with (replace with your number)
const TEST_PHONE_NUMBER = '+1234567890';
const BRAND_NAME = 'BedRockDemo';

// Create an instance of the VerifyService
const verifyService = new VerifyService();

// Test function to request verification
async function testRequestVerification() {
  try {
    console.log('=== TESTING VONAGE VERIFY REQUEST ===');
    console.log(`Testing with phone number: ${TEST_PHONE_NUMBER}`);
    
    // Request verification
    console.log('\nRequesting verification code...');
    const requestResult = await verifyService.requestVerification(
      TEST_PHONE_NUMBER,
      BRAND_NAME,
      4,  // code length
      'en-us',  // locale
      'sms'  // channel
    );
    
    console.log('Verification requested successfully:');
    console.log(JSON.stringify(requestResult, null, 2));
    console.log('\nRequest ID:', requestResult.requestId);
    console.log('Save this request ID to use when checking the verification code.');
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testRequestVerification();
