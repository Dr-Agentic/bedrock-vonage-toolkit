require('dotenv').config();
const Vonage = require('@vonage/server-sdk');

// Initialize Vonage client
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node test-number-insight.js <phoneNumber>');
  process.exit(1);
}

const phoneNumber = args[0];

// Test function to get number insights
async function testNumberInsight(phoneNumber) {
  return new Promise((resolve, reject) => {
    console.log('=== TESTING VONAGE NUMBER INSIGHT API ===');
    console.log(`Getting insights for phone number: ${phoneNumber}`);
    
    // Request number insights
    console.log('\nRequesting number insights...');
    vonage.numberInsight.get({
      level: 'advancedSync',
      number: phoneNumber
    }, (err, result) => {
      if (err) {
        console.error('Error getting number insights:', err);
        reject(err);
      } else {
        console.log('Number insights retrieved successfully:');
        console.log(JSON.stringify(result, null, 2));
        resolve(result);
      }
    });
  });
}

// Run the test
testNumberInsight(phoneNumber).catch(console.error);
