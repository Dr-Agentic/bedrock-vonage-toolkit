/**
 * Simple test script for the Vonage SMS API
 * 
 * This script demonstrates how to send an SMS message using the Vonage API
 * directly with the Vonage Node.js SDK.
 */

require('dotenv').config();
const Vonage = require('@vonage/server-sdk');

// Initialize Vonage client
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

// Configuration
const SENDER_ID = process.env.SENDER_ID || 'BedrockTest';
const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER;

// Validate configuration
if (!TEST_PHONE_NUMBER) {
  console.error('Error: TEST_PHONE_NUMBER environment variable is required');
  console.error('Please set it in your .env file: TEST_PHONE_NUMBER=+12025550123');
  process.exit(1);
}

console.log(`Sending test SMS to ${TEST_PHONE_NUMBER}...`);

// Send SMS
vonage.message.sendSms(
  SENDER_ID,
  TEST_PHONE_NUMBER,
  'This is a test message from the Bedrock Vonage Toolkit',
  {
    type: 'text'
  },
  (err, responseData) => {
    if (err) {
      console.error('❌ Error sending SMS:', err);
    } else {
      console.log('SMS sent successfully!');
      console.log('Response:', JSON.stringify(responseData, null, 2));
      
      // Check message status
      if (responseData.messages && responseData.messages.length > 0) {
        const message = responseData.messages[0];
        
        if (message.status === '0') {
          console.log('✅ Success: Message was accepted for delivery');
          console.log(`Message ID: ${message['message-id']}`);
          
          if (message['remaining-balance']) {
            console.log(`Remaining balance: ${message['remaining-balance']}`);
          }
          
          if (message['message-price']) {
            console.log(`Message price: ${message['message-price']}`);
          }
        } else {
          console.log('⚠️ Warning: Message was not accepted');
          console.log(`Status: ${message.status} - ${message['error-text']}`);
        }
      }
    }
  }
);
