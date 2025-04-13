/**
 * Simple test script for the Vonage SMS API
 * 
 * This script demonstrates how to send an SMS message using the Vonage API
 * directly with the Vonage Node.js SDK.
 */

require('dotenv').config();
const { Vonage } = require('@vonage/server-sdk');
const { Auth } = require('@vonage/auth');

// Initialize Vonage client
const auth = new Auth({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

const vonage = new Vonage(auth);

// Configuration
const SENDER_ID = process.env.SENDER_ID || 'Vonage';
const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER;

// Validate configuration
if (!TEST_PHONE_NUMBER) {
  console.error('Error: TEST_PHONE_NUMBER environment variable is required');
  console.error('Please set it in your .env file: TEST_PHONE_NUMBER=+12025550123');
  process.exit(1);
}

console.log(`Sending test SMS to ${TEST_PHONE_NUMBER}...`);

// Send SMS
vonage.sms.send({
  from: SENDER_ID,
  to: TEST_PHONE_NUMBER,
  text: 'This is a test message from the Bedrock Vonage Toolkit'
})
  .then(response => {
    console.log('SMS sent successfully!');
    console.log('Response:', JSON.stringify(response, null, 2));
    
    // Check message status
    if (response.messages && response.messages.length > 0) {
      const message = response.messages[0];
      
      if (message.status === '0') {
        console.log('✅ Success: Message was accepted for delivery');
        console.log(`Message ID: ${message.messageId}`);
        
        if (message.remainingBalance) {
          console.log(`Remaining balance: ${message.remainingBalance}`);
        }
        
        if (message.messagePrice) {
          console.log(`Message price: ${message.messagePrice}`);
        }
      } else {
        console.log('⚠️ Warning: Message was not accepted');
        console.log(`Status: ${message.status} - ${message['error-text'] || message.errorText}`);
      }
    }
  })
  .catch(err => {
    console.error('❌ Error sending SMS:', err);
    // Print the response details if available
    if (err.response) {
      console.error('Error details:', JSON.stringify(err.response, null, 2));
    }
  });
