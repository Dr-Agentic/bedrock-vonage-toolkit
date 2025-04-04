import vonageClient from '../config/vonage';

/**
 * Service for interacting with Vonage APIs
 */
export class VonageService {
  /**
   * Get comprehensive number insights
   * This is a simplified version that uses only the advanced lookup API
   * 
   * @param number - Phone number to analyze (E.164 format)
   * @returns Promise with detailed number insights
   */
  async getAdvancedNumberInsight(number: string) {
    try {
      console.log(`Getting advanced insights for number: ${number}`);
      
      // Call the advanced lookup API directly
      // Note: We're using any type here because the Vonage SDK types don't match the actual response
      const advancedInsight: any = await vonageClient.numberInsights.advancedLookup(number);
      console.log('Advanced insight response:', JSON.stringify(advancedInsight, null, 2));
      
      // Format the response into a more usable structure
      return {
        phoneNumber: number,
        basicInfo: {
          internationalFormat: advancedInsight.international_format_number || number,
          nationalFormat: advancedInsight.national_format_number || number,
          countryCode: advancedInsight.country_code || 'Unknown',
          countryName: advancedInsight.country_name || 'Unknown',
          countryPrefix: advancedInsight.country_prefix || 'Unknown'
        },
        carrierInfo: {
          name: advancedInsight.current_carrier?.name || 'Unknown',
          country: advancedInsight.current_carrier?.country || 'Unknown',
          networkType: advancedInsight.current_carrier?.network_type || 'Unknown',
          networkCode: advancedInsight.current_carrier?.network_code || 'Unknown'
        },
        validity: {
          valid: advancedInsight.valid_number === 'valid',
          reachable: advancedInsight.reachable === 'reachable',
          ported: advancedInsight.ported === 'ported',
          roaming: advancedInsight.roaming === 'roaming'
        },
        advancedDetails: {
          roamingInfo: {
            status: advancedInsight.roaming || 'unknown',
            countryCode: advancedInsight.roaming_country_code || 'unknown',
            networkName: advancedInsight.roaming_network_name || 'unknown',
            networkCode: advancedInsight.roaming_network_code || 'unknown'
          },
          portingInfo: {
            status: advancedInsight.ported || 'unknown',
            originalNetwork: advancedInsight.original_carrier?.name || 'unknown'
          },
          callerIdentity: {
            callerName: advancedInsight.caller_name || 'unknown',
            callerType: advancedInsight.caller_type || 'unknown',
            firstName: advancedInsight.first_name || 'unknown',
            lastName: advancedInsight.last_name || 'unknown'
          }
        },
        riskScore: {
          score: advancedInsight.risk_score || 0,
          recommendation: advancedInsight.risk_recommendation || 'unknown'
        },
        timestamp: new Date().toISOString(),
        rawData: advancedInsight
      };
    } catch (error) {
      console.error('Error getting advanced number insight:', error);
      throw error;
    }
  }
}
