require('dotenv').config();
const { Auth } = require('@vonage/auth');
const { Verify } = require('@vonage/verify');

// Configuration
const REQUEST_ID = '577af3471e2340e19a560f6c9a74a16e';
const CODE = '8679';

console.log(`API Key: ${process.env.VONAGE_API_KEY}`);
console.log(`API Secret: ${process.env.VONAGE_API_SECRET ? 'exists' : 'missing'}`);

// Initialize Vonage client
const auth = new Auth({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

const verify = new Verify(auth);

async function checkVerification() {
  try {
    console.log('=== TESTING VONAGE VERIFY API - CHECK ===');
    console.log(`Checking verification code for request ID: ${REQUEST_ID}`);
    console.log(`Code: ${CODE}`);
    
    // Check verification code
    const result = await verify.check({
      request_id: REQUEST_ID,
      code: CODE
    });
    
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.status === '0') {
      console.log('\n✅ Verification successful!');
    } else {
      console.log('\n❌ Verification failed!');
    }
    
    return result;
  } catch (error) {
    console.error('\n❌ Error testing verify check API:');
    console.error(error);
    throw error;
  }
}

// Run the check
checkVerification()
  .then(() => console.log('Check completed'))
  .catch(error => console.error('Error:', error.message));
