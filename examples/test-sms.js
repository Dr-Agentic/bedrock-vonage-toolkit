/**
 * Test script for the Vonage SMS API integration
 * 
 * This script demonstrates how to send an SMS message using the Vonage API
 * through the Bedrock Vonage Toolkit.
 * 
 * Usage:
 * 1. Make sure you have set up your Vonage API credentials in .env
 * 2. Run this script with Node.js: node test-sms.js
 */

require('dotenv').config();
const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000'; // Update with your deployed API URL
const SENDER_ID = process.env.SENDER_ID || 'TestApp'; // Update with your sender ID
const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER; // Should be in E.164 format, e.g., +12025550123

// Validate configuration
if (!TEST_PHONE_NUMBER) {
  console.error('Error: TEST_PHONE_NUMBER environment variable is required');
  console.error('Please set it in your .env file: TEST_PHONE_NUMBER=+12025550123');
  process.exit(1);
}

// Function to send an SMS
async function sendSms() {
  try {
    console.log(`Sending test SMS to ${TEST_PHONE_NUMBER}...`);
    
    const response = await axios.post(`${API_URL}/send-sms`, {
      from: SENDER_ID,
      to: TEST_PHONE_NUMBER,
      text: 'This is a test message from the Bedrock Vonage Toolkit'
    });
    
    console.log('SMS sent successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Check status
    if (response.data.status.code === '0') {
      console.log('✅ Success: Message was accepted for delivery');
      console.log(`Message ID: ${response.data.messageId}`);
      console.log(`Delivery status: ${response.data.deliveryStatus}`);
      
      if (response.data.remainingBalance) {
        console.log(`Remaining balance: ${response.data.remainingBalance}`);
      }
      
      if (response.data.messagePrice) {
        console.log(`Message price: ${response.data.messagePrice}`);
      }
    } else {
      console.log('⚠️ Warning: Message was accepted but with issues');
      console.log(`Status: ${response.data.status.code} - ${response.data.status.message}`);
    }
  } catch (error) {
    console.error('❌ Error sending SMS:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 400) {
        console.error('This is likely due to invalid parameters. Check your phone number format.');
      } else if (error.response.status === 401) {
        console.error('This is likely due to invalid API credentials.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Check your API_URL and network connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
  }
}

// Execute the test
sendSms();
