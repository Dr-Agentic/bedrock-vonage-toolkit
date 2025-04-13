/**
 * test-local.js
 * 
 * Purpose: Test the VonageService directly without going through the Lambda handler
 * 
 * This script tests the VonageService functionality directly, bypassing the Lambda
 * handler and API Gateway. It requires TypeScript compilation to work properly.
 * 
 * Usage:
 *   # First compile the TypeScript code
 *   npm run build
 *   
 *   # Then run the test
 *   node test-local.js
 * 
 * Configuration:
 * - Uses TEST_PHONE_NUMBER from .env file or a default number
 * - Uses local environment variables for Vonage API credentials
 * - Bypasses the Lambda handler and API Gateway
 * 
 * When to use:
 * - During development to test changes to the VonageService
 * - To isolate service-level issues from API Gateway or Lambda issues
 * - For faster testing cycles during development
 */

// Load environment variables from .env file
require('dotenv').config();

// We need to compile TypeScript files before requiring them
// For simplicity in this test, we'll use the VonageService directly
const { VonageService } = require('./dist/services/vonageService');

// Test phone number (use from .env or fallback)
const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '+14065786214';

// Execute the test
async function runTest() {
  console.log(`Testing number insight with phone number: ${TEST_PHONE_NUMBER}`);
  
  try {
    // Initialize the Vonage service
    const vonageService = new VonageService();
    
    // Get number insights
    console.log('Fetching number insights...');
    const insightData = await vonageService.getAdvancedNumberInsight(TEST_PHONE_NUMBER);
    
    // Print key information
    console.log('\n=== Number Insight Results ===');
    console.log(`Phone Number: ${insightData.phoneNumber}`);
    console.log(`Country: ${insightData.basicInfo.countryName}`);
    console.log(`Carrier: ${insightData.carrierInfo.name}`);
    console.log(`Network Type: ${insightData.carrierInfo.networkType}`);
    console.log(`Valid: ${insightData.validity.valid}`);
    console.log(`Reachable: ${insightData.validity.reachable}`);
    
    // Print full response for debugging
    console.log('\n=== Full Response ===');
    console.log(JSON.stringify(insightData, null, 2));
    
    return insightData;
  } catch (error) {
    console.error('Error executing test:', error);
    throw error;
  }
}

// Run the test
runTest()
  .then(() => console.log('\n✅ Test completed successfully!'))
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
