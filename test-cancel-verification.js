require('dotenv').config();
const { VerifyService } = require('./src/services/verifyService');

// Create an instance of the VerifyService
const verifyService = new VerifyService();

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node test-cancel-verification.js <requestId>');
  process.exit(1);
}

const requestId = args[0];

// Test function to cancel verification
async function testCancelVerification(requestId) {
  try {
    console.log('=== TESTING VONAGE VERIFY CANCEL ===');
    console.log(`Cancelling request ID: ${requestId}`);
    
    // Cancel verification request
    console.log('\nCancelling verification request...');
    const cancelResult = await verifyService.cancelVerification(requestId);
    
    console.log('Verification cancel result:');
    console.log(JSON.stringify(cancelResult, null, 2));
    
    if (cancelResult.cancelled) {
      console.log('\n✅ Verification cancelled successfully!');
    } else {
      console.log('\n❌ Verification cancellation failed!');
    }
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testCancelVerification(requestId);
