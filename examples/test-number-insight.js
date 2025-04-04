/**
 * Test script for the Number Insight Lambda function
 * 
 * This script simulates both direct API calls and Bedrock agent invocations
 * to test the Number Insight functionality.
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '+12025550123';

/**
 * Test direct API call to Number Insight endpoint
 */
async function testDirectApiCall() {
  try {
    console.log('Testing direct API call to Number Insight endpoint...');
    
    const response = await axios.post(`${API_URL}/number-insight`, {
      phoneNumber: TEST_PHONE_NUMBER
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error testing direct API call:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test Bedrock agent invocation of Number Insight action
 */
async function testBedrockAgentInvocation() {
  try {
    console.log('Testing Bedrock agent invocation of Number Insight action...');
    
    // This simulates the event structure that Bedrock sends to Lambda
    const bedrockEvent = {
      messageVersion: '1.0',
      agent: {
        name: 'TestAgent',
        id: 'agent-123'
      },
      sessionId: 'session-123',
      actionGroup: 'VonageNumberInsight',
      apiPath: '/number-insight',
      httpMethod: 'POST',
      requestBody: {
        contentType: 'application/json',
        inputText: JSON.stringify({
          phoneNumber: TEST_PHONE_NUMBER
        })
      }
    };
    
    // In a real test, you would invoke the Lambda directly
    // For this example, we'll simulate it with another API call
    const response = await axios.post(`${API_URL}/test-bedrock-invocation`, bedrockEvent);
    
    console.log('Bedrock response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error testing Bedrock invocation:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Main test function
 */
async function runTests() {
  try {
    // Test direct API call
    const directResult = await testDirectApiCall();
    console.log('\nDirect API call test completed successfully!');
    
    // Test Bedrock agent invocation
    // Uncomment when you have the test endpoint set up
    // const bedrockResult = await testBedrockAgentInvocation();
    // console.log('\nBedrock agent invocation test completed successfully!');
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('\nTest failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();
