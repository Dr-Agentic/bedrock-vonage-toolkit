/**
 * Direct test script for the Vonage SMS API integration
 * 
 * This script demonstrates how to send an SMS message using the Vonage API
 * directly through the SmsService class.
 * 
 * Usage:
 * 1. Make sure you have set up your Vonage API credentials in .env
 * 2. Run this script with Node.js: node test-sms-direct.js
 */

require('dotenv').config();
const { SmsService } = require('./src/services/smsService');

// Configuration
const SENDER_ID = process.env.SENDER_ID || 'BedrockTest';
const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER; // Should be in E.164 format

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
    
    const smsService = new SmsService();
    const result = await smsService.sendSms(
      SENDER_ID,
      TEST_PHONE_NUMBER,
      'This is a test message from the Bedrock Vonage Toolkit'
    );
    
    console.log('SMS sent successfully!');
    console.log('Response:', JSON.stringify(result, null, 2));
    
    // Check status
    if (result.status.code === '0') {
      console.log('✅ Success: Message was accepted for delivery');
      console.log(`Message ID: ${result.messageId}`);
      console.log(`Delivery status: ${result.deliveryStatus}`);
      
      if (result.remainingBalance) {
        console.log(`Remaining balance: ${result.remainingBalance}`);
      }
      
      if (result.messagePrice) {
        console.log(`Message price: ${result.messagePrice}`);
      }
    } else {
      console.log('⚠️ Warning: Message was accepted but with issues');
      console.log(`Status: ${result.status.code} - ${result.status.message}`);
    }
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
  }
}

// Execute the test
sendSms();
