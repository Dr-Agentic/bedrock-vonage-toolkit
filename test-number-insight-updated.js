require('dotenv').config();
const { Vonage } = require('@vonage/server-sdk');

// Configuration
const API_KEY = process.env.VONAGE_API_KEY;
const API_SECRET = process.env.VONAGE_API_SECRET;
const PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '+1234567890'; // Use environment variable

console.log(`Testing Number Insight for phone number: ${PHONE_NUMBER}`);

// Initialize Vonage client
const vonage = new Vonage({
  apiKey: API_KEY,
  apiSecret: API_SECRET
});

async function getAdvancedInsight() {
  try {
    console.log('\n=== TESTING VONAGE NUMBER INSIGHT API - ADVANCED ===');
    
    // Use the newer server-sdk approach
    const result = await vonage.numberInsight.advancedSync({
      number: PHONE_NUMBER
    });
    
    console.log('Advanced Insight Response:', JSON.stringify(result, null, 2));
    
    // Format the response into a more readable structure
    const formattedResult = {
      phoneNumber: PHONE_NUMBER,
      basicInfo: {
        internationalFormat: result.international_format_number || PHONE_NUMBER,
        nationalFormat: result.national_format_number || PHONE_NUMBER,
        countryCode: result.country_code || 'Unknown',
        countryName: result.country_name || 'Unknown',
        countryPrefix: result.country_prefix || 'Unknown'
      },
      carrierInfo: {
        name: result.current_carrier?.name || 'Unknown',
        country: result.current_carrier?.country || 'Unknown',
        networkType: result.current_carrier?.network_type || 'Unknown',
        networkCode: result.current_carrier?.network_code || 'Unknown'
      },
      validity: {
        valid: result.valid_number === 'valid',
        reachable: result.reachable === 'reachable',
        ported: result.ported === 'ported',
        roaming: result.roaming === 'roaming'
      },
      advancedDetails: {
        roamingInfo: {
          status: result.roaming || 'unknown',
          countryCode: result.roaming_country_code || 'unknown',
          networkName: result.roaming_network_name || 'unknown',
          networkCode: result.roaming_network_code || 'unknown'
        },
        portingInfo: {
          status: result.ported || 'unknown',
          originalNetwork: result.original_carrier?.name || 'unknown'
        },
        callerIdentity: {
          callerName: result.caller_name || 'unknown',
          callerType: result.caller_type || 'unknown',
          firstName: result.first_name || 'unknown',
          lastName: result.last_name || 'unknown'
        }
      },
      riskScore: {
        score: result.risk_score || 0,
        recommendation: result.risk_recommendation || 'unknown'
      }
    };
    
    console.log('\nFormatted Insight Data:', JSON.stringify(formattedResult, null, 2));
    
    return result;
  } catch (error) {
    console.error('Error getting advanced number insight:', error);
    throw error;
  }
}

// Run test
async function main() {
  try {
    await getAdvancedInsight();
    
    console.log('\n✅ Number Insight tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Number Insight tests failed:', error);
    process.exit(1);
  }
}

main();
