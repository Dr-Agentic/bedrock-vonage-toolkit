require('dotenv').config();
const { VonageService } = require('./dist/services/vonageService');

// Configuration
const PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '+1234567890'; // Use environment variable

console.log(`Testing Number Insight Service for phone number: ${PHONE_NUMBER}`);

// Initialize VonageService
const vonageService = new VonageService();

// Run test
async function main() {
  try {
    console.log('=== TESTING VONAGE NUMBER INSIGHT SERVICE ===');
    
    const result = await vonageService.getAdvancedNumberInsight(PHONE_NUMBER);
    
    console.log('\nFormatted Insight Data:', JSON.stringify(result, null, 2));
    
    console.log('\n✅ Number Insight Service test completed successfully!');
  } catch (error) {
    console.error('\n❌ Number Insight Service test failed:', error);
    process.exit(1);
  }
}

main();
