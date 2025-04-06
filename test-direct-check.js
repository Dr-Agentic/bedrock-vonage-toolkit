const https = require('https');
require('dotenv').config();

// Configuration
const API_KEY = process.env.VONAGE_API_KEY;
const API_SECRET = process.env.VONAGE_API_SECRET;
const REQUEST_ID = process.argv[2] || ''; // Get request ID from command line
const CODE = process.argv[3] || ''; // Get code from command line

if (!REQUEST_ID || !CODE) {
  console.error('Usage: node test-direct-check.js <request_id> <code>');
  process.exit(1);
}

// Build the request options
const options = {
  hostname: 'api.nexmo.com',
  path: `/verify/check/json?api_key=${API_KEY}&api_secret=${API_SECRET}&request_id=${REQUEST_ID}&code=${CODE}`,
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
      console.log('Response:', JSON.stringify(parsedData, null, 2));
      
      if (parsedData.status === '0') {
        console.log('\n✅ Verification successful!');
      } else {
        console.log('\n❌ Verification failed!');
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
