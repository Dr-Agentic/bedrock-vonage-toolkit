require('dotenv').config();
const Vonage = require('@vonage/server-sdk');

// Initialize Vonage client
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node test-sms.js <phoneNumber> "<message>"');
  process.exit(1);
}

const phoneNumber = args[0];
const message = args[1];
const from = 'BedRockDemo';

// Test function to send SMS
async function testSendSms(to, text, from) {
  return new Promise((resolve, reject) => {
    console.log('=== TESTING VONAGE SMS API ===');
    console.log(`Sending SMS to: ${to}`);
    console.log(`Message: ${text}`);
    console.log(`From: ${from}`);
    
    // Send SMS
    console.log('\nSending SMS...');
    vonage.message.sendSms(from, to, text, {}, (err, responseData) => {
      if (err) {
        console.error('Error sending SMS:', err);
        reject(err);
      } else {
        console.log('SMS sent successfully:');
        
        if (responseData.messages[0]['status'] === '0') {
          console.log('✅ Message sent successfully.');
          console.log(`Message ID: ${responseData.messages[0]['message-id']}`);
          console.log(`Remaining balance: ${responseData.messages[0]['remaining-balance']}`);
        } else {
          console.log(`❌ Message failed with error: ${responseData.messages[0]['error-text']}`);
        }
        
        console.log(JSON.stringify(responseData, null, 2));
        resolve(responseData);
      }
    });
  });
}

// Run the test
testSendSms(phoneNumber, message, from).catch(console.error);
