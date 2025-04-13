/**
 * test-direct-api.js
 * 
 * Purpose: Test the deployed API endpoint via HTTPS requests
 * 
 * This script makes direct HTTP requests to your deployed API Gateway endpoint
 * to test the Number Insight functionality. It's useful for verifying that your
 * deployed API is working correctly and for diagnosing any issues with the
 * deployed service.
 * 
 * Usage:
 *   node test-direct-api.js
 * 
 * Configuration:
 * - Uses TEST_PHONE_NUMBER from .env file or a default number
 * - Automatically targets your deployed API endpoint
 * - Displays the full API response including any error messages
 * 
 * When to use:
 * - After deployment to verify your API is working correctly
 * - To diagnose issues with the deployed service
 * - To test with different phone numbers by modifying the script
 */

require('dotenv').config();
const https = require('https');

// Configuration
const API_ENDPOINT = 'https://0di0w175of.execute-api.us-east-1.amazonaws.com/dev';
const PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '+14065786214';

console.log(`Testing API with phone number: ${PHONE_NUMBER}`);

// Function to make a request to the API
function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    // Convert data to JSON string
    const postData = JSON.stringify(data);
    
    // Extract hostname and path from API_ENDPOINT
    const url = new URL(API_ENDPOINT + path);
    
    // Build the request options
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log(`Making request to: ${url.hostname}${url.pathname}`);
    
    // Make the request
    const req = https.request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          console.log('Response:', JSON.stringify(parsedData, null, 2));
          resolve(parsedData);
        } catch (error) {
          console.error('Error parsing response:', error);
          console.log('Raw response:', responseData);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`Error making request:`, error);
      reject(error);
    });
    
    // Write data to request body
    req.write(postData);
    req.end();
  });
}

// Test the Number Insight API
async function testNumberInsight() {
  console.log('\n=== TESTING NUMBER INSIGHT API ===');
  
  try {
    const response = await makeRequest('/number-insight', {
      phoneNumber: PHONE_NUMBER
    });
    
    console.log('Number Insight test completed successfully!');
    return response;
  } catch (error) {
    console.error('Number Insight test failed:', error);
    throw error;
  }
}

// Run the tests
async function main() {
  try {
    await testNumberInsight();
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  }
}

main();
