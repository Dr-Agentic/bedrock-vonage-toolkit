const https = require('https');
require('dotenv').config();

// Configuration
const API_KEY = process.env.VONAGE_API_KEY;
const API_SECRET = process.env.VONAGE_API_SECRET;
const PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '+1234567890'; // Use environment variable
const BRAND_NAME = 'BedrockTest';

// Mock device information for silent auth
const deviceInfo = {
  app_hash: 'abcdefghijklmnopqrstuvwxyz123456', // Example app hash
  sdk_version: '2.3.0',                         // Example SDK version
  device_model: 'iPhone 13',                    // Example device model
  os_version: 'iOS 16.5',                       // Example OS version
  country_code: 'US',                           // Example country code
  source_ip: '203.0.113.1',                     // Example IP address
  silent_auth_timeout_secs: 10                  // Timeout for silent auth in seconds
};

// Build the request options for verification request
const requestOptions = {
  hostname: 'api.nexmo.com',
  path: `/verify/json?api_key=${API_KEY}&api_secret=${API_SECRET}&number=${PHONE_NUMBER}&brand=${BRAND_NAME}&workflow_id=1&app_hash=${deviceInfo.app_hash}&sdk_version=${deviceInfo.sdk_version}&device_model=${deviceInfo.device_model}&os_version=${deviceInfo.os_version}&country_code=${deviceInfo.country_code}&source_ip=${deviceInfo.source_ip}&silent_auth_timeout_secs=${deviceInfo.silent_auth_timeout_secs}`,
  method: 'GET'
};

console.log('=== TESTING VONAGE VERIFY API WITH SILENT AUTH - DIRECT HTTP ===');
console.log(`Requesting verification for phone number: ${PHONE_NUMBER}`);
console.log(`Making request to: ${requestOptions.hostname}${requestOptions.path}`);

// Make the verification request
const req = https.request(requestOptions, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(data);
      console.log('Response:', JSON.stringify(parsedData, null, 2));
      
      if (parsedData.request_id) {
        console.log('\n✅ Verification request successful!');
        console.log(`Request ID: ${parsedData.request_id}`);
        
        if (parsedData.silent_auth === true) {
          console.log('\n🔍 Silent authentication is in progress!');
          console.log('Wait for the silent auth to complete or timeout...');
          
          // Save request ID to a file for later use
          require('fs').writeFileSync('last-request-id-direct-silent.txt', parsedData.request_id);
          console.log('\nRequest ID saved to last-request-id-direct-silent.txt');
          
          // Check the status after a delay
          setTimeout(() => {
            checkVerificationStatus(parsedData.request_id);
          }, 5000); // Wait 5 seconds before checking
        } else {
          console.log('\n📱 Silent authentication not available, SMS verification initiated.');
          console.log('\nUse this request ID to check the verification code:');
          console.log(`node test-direct-check.js ${parsedData.request_id} <code>`);
          
          // Save request ID to a file for later use
          require('fs').writeFileSync('last-request-id-direct-silent.txt', parsedData.request_id);
          console.log('\nRequest ID saved to last-request-id-direct-silent.txt');
        }
      } else {
        console.log('\n❌ Verification request failed!');
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error making request:', error);
});

req.end();

// Function to check verification status
function checkVerificationStatus(requestId) {
  console.log('\n=== CHECKING VERIFICATION STATUS ===');
  console.log(`Checking status for request ID: ${requestId}`);
  
  // Build the request options for status check
  const statusOptions = {
    hostname: 'api.nexmo.com',
    path: `/verify/search/json?api_key=${API_KEY}&api_secret=${API_SECRET}&request_id=${requestId}`,
    method: 'GET'
  };
  
  console.log(`Making request to: ${statusOptions.hostname}${statusOptions.path}`);
  
  // Make the status check request
  const statusReq = https.request(statusOptions, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        console.log('Status Response:', JSON.stringify(parsedData, null, 2));
        
        if (parsedData.status === '0') {
          if (parsedData.checks && parsedData.checks.length > 0) {
            const latestCheck = parsedData.checks[parsedData.checks.length - 1];
            console.log(`\nVerification status: ${latestCheck.status}`);
            
            if (latestCheck.status === 'COMPLETED') {
              console.log('\n✅ Silent authentication completed successfully!');
            } else if (latestCheck.status === 'FAILED') {
              console.log('\n❌ Silent authentication failed, SMS verification initiated.');
            } else {
              console.log(`\nCurrent status: ${latestCheck.status}`);
            }
          } else {
            console.log('\nNo verification checks found yet.');
          }
        } else {
          console.log('\n❌ Status check failed!');
        }
      } catch (e) {
        console.error('Error parsing JSON:', e);
        console.log('Raw response:', data);
      }
    });
  });
  
  statusReq.on('error', (error) => {
    console.error('Error making status request:', error);
  });
  
  statusReq.end();
}
