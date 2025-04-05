require('dotenv').config();
const { VerifyService } = require('./src/services/verifyService');

// Create an instance of the VerifyService
const verifyService = new VerifyService();

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node test-check-verification.js <requestId> <code>');
  process.exit(1);
}

const requestId = args[0];
const code = args[1];

// Test function to check verification
async function testCheckVerification(requestId, code) {
  try {
    console.log('=== TESTING VONAGE VERIFY CHECK ===');
    console.log(`Checking request ID: ${requestId} with code: ${code}`);
    
    // Check verification code
    console.log('\nChecking verification code...');
    const checkResult = await verifyService.checkVerification(requestId, code);
    
    console.log('Verification check result:');
    console.log(JSON.stringify(checkResult, null, 2));
    
    if (checkResult.verified) {
      console.log('\n✅ Verification successful!');
    } else {
      console.log('\n❌ Verification failed!');
    }
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testCheckVerification(requestId, code);
