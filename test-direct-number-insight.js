const https = require('https');
require('dotenv').config();

// Configuration
const API_KEY = process.env.VONAGE_API_KEY;
const API_SECRET = process.env.VONAGE_API_SECRET;
const PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '+1234567890'; // Use environment variable

console.log(`Testing Number Insight for phone number: ${PHONE_NUMBER}`);

// Function to make a request to the Vonage Number Insight API
function makeRequest(level) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== TESTING VONAGE NUMBER INSIGHT API - ${level.toUpperCase()} ===`);
    
    // Build the request URL
    const url = `/ni/${level}/json?api_key=${API_KEY}&api_secret=${API_SECRET}&number=${PHONE_NUMBER}`;
    
    // Build the request options
    const options = {
      hostname: 'api.nexmo.com',
      path: url,
      method: 'GET'
    };
    
    console.log(`Making request to: ${options.hostname}${options.path}`);
    
    // Make the request
    const req = https.request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          console.log(`${level.toUpperCase()} Insight Response:`, JSON.stringify(parsedData, null, 2));
          resolve(parsedData);
        } catch (error) {
          console.error('Error parsing response:', error);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`Error making request to ${level} API:`, error);
      reject(error);
    });
    
    req.end();
  });
}

// Run all tests
async function main() {
  try {
    // Test basic level
    await makeRequest('basic');
    
    // Test standard level
    await makeRequest('standard');
    
    // Test advanced level
    await makeRequest('advanced');
    
    console.log('\n✅ Number Insight tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Number Insight tests failed:', error);
    process.exit(1);
  }
}

main();
