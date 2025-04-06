require('dotenv').config();
const axios = require('axios');

// Configuration
const LOCAL_API_URL = 'http://localhost:3000';
const PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '+1234567890'; // Replace with your test phone number
const BRAND_NAME = 'BedrockTest';

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node test-local-serverless-modern.js <command> [params...]');
  console.error('Commands:');
  console.error('  request - Request a verification code');
  console.error('  check <requestId> <code> - Check a verification code');
  console.error('  cancel <requestId> - Cancel a verification request');
  process.exit(1);
}

const command = args[0];

async function testRequestVerification() {
  try {
    console.log('=== TESTING LOCAL SERVERLESS VERIFY API - REQUEST ===');
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
      console.log(`node test-local-serverless-modern.js check ${response.data.requestId} <code>`);
      
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

async function testCheckVerification(requestId, code) {
  try {
    console.log('=== TESTING LOCAL SERVERLESS VERIFY API - CHECK ===');
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
    
    if (response.data && response.data.success) {
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

async function testCancelVerification(requestId) {
  try {
    console.log('=== TESTING LOCAL SERVERLESS VERIFY API - CANCEL ===');
    console.log(`Cancelling verification for request ID: ${requestId}`);
    
    // Cancel verification
    console.log('\nSending request to local serverless endpoint...');
    const response = await axios.post(`${LOCAL_API_URL}/cancel-verification`, {
      requestId: requestId
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.success) {
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

// Run the appropriate test based on the command
async function main() {
  try {
    switch (command) {
      case 'request':
        await testRequestVerification();
        break;
      case 'check':
        if (args.length < 3) {
          let requestId = args[1];
          let code;
          
          if (!requestId) {
            try {
              requestId = require('fs').readFileSync('last-request-id.txt', 'utf8').trim();
              console.log(`Using request ID from file: ${requestId}`);
            } catch (error) {
              console.error('Error reading request ID from file.');
              console.error('Usage: node test-local-serverless-modern.js check <requestId> <code>');
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
          
          await testCheckVerification(requestId, code);
        } else {
          await testCheckVerification(args[1], args[2]);
        }
        break;
      case 'cancel':
        if (args.length < 2) {
          let requestId = args[1];
          
          if (!requestId) {
            try {
              requestId = require('fs').readFileSync('last-request-id.txt', 'utf8').trim();
              console.log(`Using request ID from file: ${requestId}`);
            } catch (error) {
              console.error('Error reading request ID from file.');
              console.error('Usage: node test-local-serverless-modern.js cancel <requestId>');
              process.exit(1);
            }
          }
          
          await testCancelVerification(requestId);
        } else {
          await testCancelVerification(args[1]);
        }
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error('Usage: node test-local-serverless-modern.js <command> [params...]');
        console.error('Commands: request, check, cancel');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
