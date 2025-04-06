require('dotenv').config();
const { Auth } = require('@vonage/auth');
const { Verify } = require('@vonage/verify');

// Configuration
const PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '+1234567890'; // Use environment variable
const BRAND_NAME = 'BedrockTest';

console.log(`Using phone number: ${PHONE_NUMBER}`);

// Initialize Vonage client
const auth = new Auth({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

const verify = new Verify(auth);

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node test-verify-specific.js <command> [params...]');
  console.error('Commands:');
  console.error('  request - Request a verification code');
  console.error('  check <requestId> <code> - Check a verification code');
  console.error('  cancel <requestId> - Cancel a verification request');
  process.exit(1);
}

const command = args[0];

async function requestVerification() {
  try {
    console.log('=== TESTING VONAGE VERIFY API - REQUEST ===');
    console.log(`Requesting verification for phone number: ${PHONE_NUMBER}`);
    
    // Request verification
    const result = await verify.start({
      number: PHONE_NUMBER,
      brand: BRAND_NAME,
      workflow_id: 1 // Use Silent Auth -> SMS -> Voice call
    });
    
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.requestId) {
      console.log('\n✅ Verification request successful!');
      console.log(`Request ID: ${result.requestId}`);
      
      if (result.silent_auth === true) {
        console.log('\n🔍 Silent authentication is in progress!');
      } else {
        console.log('\n📱 SMS verification initiated.');
      }
      
      console.log('\nUse this request ID to check the verification code:');
      console.log(`node test-verify-specific.js check ${result.requestId} <code>`);
      
      // Save request ID to a file for later use
      require('fs').writeFileSync('last-request-id-specific.txt', result.requestId);
      console.log('\nRequest ID saved to last-request-id-specific.txt');
    } else {
      console.log('\n❌ Verification request failed!');
    }
    
    return result;
  } catch (error) {
    console.error('\n❌ Error testing verify API:');
    console.error(error);
    throw error;
  }
}

async function checkVerification(requestId, code) {
  try {
    console.log('=== TESTING VONAGE VERIFY API - CHECK ===');
    console.log(`Checking verification code for request ID: ${requestId}`);
    console.log(`Code: ${code}`);
    
    // Check verification code
    const result = await verify.check({
      request_id: requestId,
      code: code
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

async function cancelVerification(requestId) {
  try {
    console.log('=== TESTING VONAGE VERIFY API - CANCEL ===');
    console.log(`Cancelling verification for request ID: ${requestId}`);
    
    // Cancel verification
    const result = await verify.cancel({
      request_id: requestId
    });
    
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.status === '0') {
      console.log('\n✅ Verification cancellation successful!');
    } else {
      console.log('\n❌ Verification cancellation failed!');
    }
    
    return result;
  } catch (error) {
    console.error('\n❌ Error testing verify cancel API:');
    console.error(error);
    throw error;
  }
}

// Run the appropriate test based on the command
async function main() {
  try {
    switch (command) {
      case 'request':
        await requestVerification();
        break;
      case 'check':
        if (args.length < 3) {
          let requestId = args[1];
          let code;
          
          if (!requestId) {
            try {
              requestId = require('fs').readFileSync('last-request-id-specific.txt', 'utf8').trim();
              console.log(`Using request ID from file: ${requestId}`);
            } catch (error) {
              console.error('Error reading request ID from file.');
              console.error('Usage: node test-verify-specific.js check <requestId> <code>');
              process.exit(1);
            }
          }
          
          code = args[2];
          if (!code) {
            code = await new Promise(resolve => {
              const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
              });
              readline.question('Enter the verification code: ', code => {
                readline.close();
                resolve(code);
              });
            });
          }
          
          await checkVerification(requestId, code);
        } else {
          await checkVerification(args[1], args[2]);
        }
        break;
      case 'cancel':
        if (args.length < 2) {
          let requestId = args[1];
          
          if (!requestId) {
            try {
              requestId = require('fs').readFileSync('last-request-id-specific.txt', 'utf8').trim();
              console.log(`Using request ID from file: ${requestId}`);
            } catch (error) {
              console.error('Error reading request ID from file.');
              console.error('Usage: node test-verify-specific.js cancel <requestId>');
              process.exit(1);
            }
          }
          
          await cancelVerification(requestId);
        } else {
          await cancelVerification(args[1]);
        }
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error('Usage: node test-verify-specific.js <command> [params...]');
        console.error('Commands: request, check, cancel');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
