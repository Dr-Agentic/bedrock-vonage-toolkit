import vonageClient from '../config/vonage';

/**
 * Service for interacting with Vonage APIs
 */
export class VonageService {
  /**
   * Get comprehensive number insights including SIM swap detection and advanced data
   * 
   * @param number - Phone number to analyze (E.164 format)
   * @returns Promise with detailed number insights
   */
  async getAdvancedNumberInsight(number: string) {
    try {
      // Get basic number information
      const basicInsight = await vonageClient.numberInsight.basic({
        number
      });
      
      // Get standard number information (includes carrier details)
      const standardInsight = await vonageClient.numberInsight.standard({
        number
      });
      
      // Get advanced number information (includes roaming, porting, etc.)
      const advancedInsight = await vonageClient.numberInsight.advanced({
        number,
        async: false
      });
      
      // Get SIM swap information
      const simSwapInsight = await vonageClient.numberInsight.simSwap({
        number
      });
      
      // Combine all insights into a comprehensive report
      return {
        phoneNumber: number,
        basicInfo: {
          internationalFormat: basicInsight.international_format_number,
          nationalFormat: basicInsight.national_format_number,
          countryCode: basicInsight.country_code,
          countryName: basicInsight.country_name,
          countryPrefix: basicInsight.country_prefix
        },
        carrierInfo: {
          name: standardInsight.current_carrier?.name || 'Unknown',
          country: standardInsight.current_carrier?.country || 'Unknown',
          networkType: standardInsight.current_carrier?.network_type || 'Unknown',
          networkCode: standardInsight.current_carrier?.network_code || 'Unknown'
        },
        validity: {
          valid: advancedInsight.valid === 'valid',
          reachable: advancedInsight.reachable === 'reachable',
          ported: advancedInsight.ported === 'ported',
          roaming: advancedInsight.roaming === 'roaming'
        },
        simSwapInfo: {
          swapped: simSwapInsight.swapped || false,
          swapTimestamp: simSwapInsight.swap_timestamp || null,
          daysSinceSwap: simSwapInsight.days_since_swap || 0
        },
        advancedDetails: {
          roamingInfo: {
            status: advancedInsight.roaming_status || 'unknown',
            countryCode: advancedInsight.roaming_country_code || 'unknown',
            networkName: advancedInsight.roaming_network_name || 'unknown',
            networkCode: advancedInsight.roaming_network_code || 'unknown'
          },
          portingInfo: {
            status: advancedInsight.ported_status || 'unknown',
            originalNetwork: advancedInsight.original_network || 'unknown'
          },
          ipInfo: {
            ipMatchLevel: advancedInsight.ip_match_level || 'unknown',
            ipCountry: advancedInsight.ip_country || 'unknown',
            ipWarnings: advancedInsight.ip_warnings || []
          },
          deviceInfo: {
            deviceModel: advancedInsight.device_model || 'unknown',
            deviceBrand: advancedInsight.device_brand || 'unknown',
            deviceOs: advancedInsight.device_os || 'unknown'
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
        rawData: {
          basic: basicInsight,
          standard: standardInsight,
          advanced: advancedInsight,
          simSwap: simSwapInsight
        }
      };
    } catch (error) {
      console.error('Error getting comprehensive number insight:', error);
      throw error;
    }
  }
}
