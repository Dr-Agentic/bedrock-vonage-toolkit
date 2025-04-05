require('dotenv').config();
const { VerifyService } = require('./src/services/verifyService');

// Phone number to test with (replace with your number)
const TEST_PHONE_NUMBER = '+1234567890';
const BRAND_NAME = 'BedRockDemo';

// Create an instance of the VerifyService
const verifyService = new VerifyService();

// Test function to run the verification flow
async function testVerifyFlow() {
  try {
    console.log('=== TESTING VONAGE VERIFY API ===');
    console.log(`Testing with phone number: ${TEST_PHONE_NUMBER}`);
    
    // Step 1: Request verification
    console.log('\n1. Requesting verification code...');
    const requestResult = await verifyService.requestVerification(
      TEST_PHONE_NUMBER,
      BRAND_NAME,
      4,  // code length
      'en-us',  // locale
      'sms'  // channel
    );
    
    console.log('Verification requested successfully:');
    console.log(JSON.stringify(requestResult, null, 2));
    
    const requestId = requestResult.requestId;
    
    // Step 2: Prompt for verification code
    console.log('\n2. Please enter the verification code received on your phone:');
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('Code: ', async (code) => {
      try {
        // Step 3: Check verification code
        console.log('\n3. Checking verification code...');
        const checkResult = await verifyService.checkVerification(requestId, code);
        
        console.log('Verification check result:');
        console.log(JSON.stringify(checkResult, null, 2));
        
        if (checkResult.verified) {
          console.log('\n✅ Verification successful!');
        } else {
          console.log('\n❌ Verification failed!');
        }
      } catch (error) {
        console.error('Error checking verification:', error);
      } finally {
        readline.close();
      }
    });
    
  } catch (error) {
    console.error('Error in test flow:', error);
  }
}

// Run the test
testVerifyFlow();
