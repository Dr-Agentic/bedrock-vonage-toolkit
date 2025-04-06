require('dotenv').config();
const { Auth } = require('@vonage/auth');
const { NumberInsights } = require('@vonage/number-insights');

// Configuration
const PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '+1234567890'; // Use environment variable

console.log(`Testing Number Insight for phone number: ${PHONE_NUMBER}`);

// Initialize Vonage client
const auth = new Auth({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

const numberInsights = new NumberInsights(auth);

async function getBasicInsight() {
  try {
    console.log('=== TESTING VONAGE NUMBER INSIGHT API - BASIC ===');
    
    const result = await numberInsights.lookupBasic({
      number: PHONE_NUMBER
    });
    
    console.log('Basic Insight Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error getting basic number insight:', error);
    throw error;
  }
}

async function getStandardInsight() {
  try {
    console.log('\n=== TESTING VONAGE NUMBER INSIGHT API - STANDARD ===');
    
    const result = await numberInsights.lookupStandard({
      number: PHONE_NUMBER
    });
    
    console.log('Standard Insight Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error getting standard number insight:', error);
    throw error;
  }
}

async function getAdvancedInsight() {
  try {
    console.log('\n=== TESTING VONAGE NUMBER INSIGHT API - ADVANCED ===');
    
    const result = await numberInsights.lookupAdvancedSync({
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

// Run all tests
async function main() {
  try {
    await getBasicInsight();
    await getStandardInsight();
    await getAdvancedInsight();
    
    console.log('\n✅ Number Insight tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Number Insight tests failed:', error);
    process.exit(1);
  }
}

main();
