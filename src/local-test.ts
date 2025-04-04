/**
 * Local test script for the Vonage Number Insight functionality
 * This script directly tests the VonageService without going through Lambda
 */

import dotenv from 'dotenv';
import { VonageService } from './services/vonageService';

// Load environment variables
dotenv.config();

// Test phone number from environment or use default
const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '+16505551234';

async function runTest() {
  console.log(`Testing Advanced Number Insight with phone number: ${testPhoneNumber}`);
  
  try {
    // Initialize the Vonage service
    const vonageService = new VonageService();
    
    // Get advanced number insights
    console.log('Fetching advanced number insights...');
    const insights = await vonageService.getAdvancedNumberInsight(testPhoneNumber);
    
    // Print results
    console.log('\nNumber Insight Results:');
    console.log('=======================');
    console.log(`Phone Number: ${insights.phoneNumber}`);
    console.log(`Country: ${insights.basicInfo.countryName}`);
    
    console.log('\nCurrent Carrier:');
    console.log(`- Name: ${insights.carrierInfo.name}`);
    console.log(`- Country: ${insights.carrierInfo.country}`);
    console.log(`- Network Type: ${insights.carrierInfo.networkType}`);
    console.log(`- Network Code: ${insights.carrierInfo.networkCode}`);
    
    console.log('\nOriginal Carrier:');
    console.log(`- Name: ${insights.advancedDetails.portingInfo.originalNetwork}`);
    console.log(`- Country: ${insights.rawData.original_carrier?.country || 'Unknown'}`);
    console.log(`- Network Type: ${insights.rawData.original_carrier?.network_type || 'Unknown'}`);
    console.log(`- Network Code: ${insights.rawData.original_carrier?.network_code || 'Unknown'}`);
    
    console.log('\nValidity:');
    console.log(`- Valid: ${insights.validity.valid}`);
    console.log(`- Reachable: ${insights.validity.reachable}`);
    console.log(`- Ported: ${insights.validity.ported}`);
    console.log(`- Roaming: ${insights.validity.roaming}`);
    console.log(`- Roaming Country: ${insights.advancedDetails.roamingInfo.countryCode}`);
    
    // Calculate if carrier has changed
    const carrierChanged = 
      insights.carrierInfo.name !== insights.advancedDetails.portingInfo.originalNetwork &&
      insights.advancedDetails.portingInfo.originalNetwork !== 'unknown';
    
    console.log('\nFraud Indicators:');
    console.log(`- Carrier Changed: ${carrierChanged}`);
    console.log(`- Risk Score: ${insights.riskScore.score}`);
    console.log(`- Risk Recommendation: ${insights.riskScore.recommendation}`);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error running test:', error);
  }
}

// Run the test
runTest();

// Run the test
runTest();
