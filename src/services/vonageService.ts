import axios from 'axios';

/**
 * Interface for Vonage Number Insight API response
 */
export interface VonageNumberInsightResponse {
  status?: number;
  status_message?: string;
  request_id?: string;
  international_format_number?: string;
  national_format_number?: string;
  country_code?: string;
  country_code_iso3?: string;
  country_name?: string;
  country_prefix?: string;
  request_price?: string;
  remaining_balance?: string;
  current_carrier?: {
    network_code?: string;
    name?: string;
    country?: string;
    network_type?: string;
  };
  original_carrier?: {
    network_code?: string;
    name?: string;
    country?: string;
    network_type?: string;
  };
  valid_number?: string;
  reachable?: string;
  ported?: string;
  roaming?: string;
  roaming_country_code?: string;
  roaming_network_name?: string;
  roaming_network_code?: string;
  caller_name?: string;
  caller_type?: string;
  first_name?: string;
  last_name?: string;
  risk_score?: number;
  risk_recommendation?: string;
  lookup_outcome?: number;
  lookup_outcome_message?: string;
}

/**
 * Interface for formatted number insight data
 */
export interface FormattedNumberInsight {
  phoneNumber: string;
  basicInfo: {
    internationalFormat: string;
    nationalFormat: string;
    countryCode: string;
    countryName: string;
    countryPrefix: string;
  };
  carrierInfo: {
    name: string;
    country: string;
    networkType: string;
    networkCode: string;
  };
  validity: {
    valid: boolean;
    reachable: boolean;
    ported: boolean;
    roaming: boolean;
  };
  advancedDetails: {
    roamingInfo: {
      status: string;
      countryCode: string;
      networkName: string;
      networkCode: string;
    };
    portingInfo: {
      status: string;
      originalNetwork: string;
    };
    callerIdentity: {
      callerName: string;
      callerType: string;
      firstName: string;
      lastName: string;
    };
  };
  riskScore: {
    score: number;
    recommendation: string;
  };
  timestamp: string;
  rawData: VonageNumberInsightResponse;
}

/**
 * Service for interacting with Vonage APIs
 */
export class VonageService {
  /**
   * Get comprehensive number insights using direct API call
   * 
   * @param number - Phone number to analyze (E.164 format)
   * @returns Promise with detailed number insights
   */
  async getAdvancedNumberInsight(number: string): Promise<FormattedNumberInsight> {
    try {
      console.log(`Getting advanced insights for number: ${number}`);
      
      // Get Vonage credentials
      const credentials = await this.getVonageCredentials();
      
      // Make direct API call to Vonage Number Insight API
      const url = `https://api.nexmo.com/ni/advanced/json?api_key=${credentials.apiKey}&api_secret=${credentials.apiSecret}&number=${number}`;
      
      console.log(`Making request to: ${url}`);
      
      const response = await axios.get<VonageNumberInsightResponse>(url);
      const insights = response.data;
      
      console.log('Advanced insight response:', JSON.stringify(insights, null, 2));
      
      // Format the response into a more usable structure
      return {
        phoneNumber: number,
        basicInfo: {
          internationalFormat: insights.international_format_number || number,
          nationalFormat: insights.national_format_number || number,
          countryCode: insights.country_code || 'Unknown',
          countryName: insights.country_name || 'Unknown',
          countryPrefix: insights.country_prefix || 'Unknown'
        },
        carrierInfo: {
          name: insights.current_carrier?.name || 'Unknown',
          country: insights.current_carrier?.country || 'Unknown',
          networkType: insights.current_carrier?.network_type || 'Unknown',
          networkCode: insights.current_carrier?.network_code || 'Unknown'
        },
        validity: {
          valid: insights.valid_number === 'valid',
          reachable: insights.reachable === 'reachable',
          ported: insights.ported === 'ported',
          roaming: insights.roaming === 'roaming'
        },
        advancedDetails: {
          roamingInfo: {
            status: insights.roaming || 'unknown',
            countryCode: insights.roaming_country_code || 'unknown',
            networkName: insights.roaming_network_name || 'unknown',
            networkCode: insights.roaming_network_code || 'unknown'
          },
          portingInfo: {
            status: insights.ported || 'unknown',
            originalNetwork: insights.original_carrier?.name || 'unknown'
          },
          callerIdentity: {
            callerName: insights.caller_name || 'unknown',
            callerType: insights.caller_type || 'unknown',
            firstName: insights.first_name || 'unknown',
            lastName: insights.last_name || 'unknown'
          }
        },
        riskScore: {
          score: insights.risk_score || 0,
          recommendation: insights.risk_recommendation || 'unknown'
        },
        timestamp: new Date().toISOString(),
        rawData: insights
      };
    } catch (error) {
      console.error('Error getting advanced number insight:', error);
      throw error;
    }
  }
  
  /**
   * Get Vonage credentials from environment variables
   * @returns Promise with API key and secret
   */
  private async getVonageCredentials(): Promise<{ apiKey: string; apiSecret: string }> {
    // For local development, use environment variables
    if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET) {
      return {
        apiKey: process.env.VONAGE_API_KEY,
        apiSecret: process.env.VONAGE_API_SECRET
      };
    }
    
    throw new Error('Vonage API credentials not found');
  }
}
