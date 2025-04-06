import { VonageService, FormattedNumberInsight } from '../services/vonageService';
import { validatePhoneNumber } from '../utils/validators';

/**
 * Interface for NumberInsightAction input parameters
 */
export interface NumberInsightParams {
  phoneNumber: string;
}

/**
 * Interface for NumberInsightAction response
 */
export interface NumberInsightResponse {
  success: boolean;
  data: FormattedNumberInsight | null;
  message: string;
}

/**
 * Action class for handling Number Insight operations
 */
export class NumberInsightAction {
  private vonageService: VonageService;
  
  /**
   * Constructor
   * @param vonageService - Instance of VonageService
   */
  constructor(vonageService: VonageService = new VonageService()) {
    this.vonageService = vonageService;
  }
  
  /**
   * Execute the Number Insight action
   * @param params - Parameters containing the phone number to analyze
   * @returns Promise with the Number Insight response
   */
  async execute(params: NumberInsightParams): Promise<NumberInsightResponse> {
    try {
      const { phoneNumber } = params;
      
      // Validate phone number
      if (!validatePhoneNumber(phoneNumber)) {
        return {
          success: false,
          data: null,
          message: 'Invalid phone number format. Please use E.164 format (e.g., +12025550142)'
        };
      }
      
      // Get number insight data
      const insightData = await this.vonageService.getAdvancedNumberInsight(phoneNumber);
      
      return {
        success: true,
        data: insightData,
        message: 'Successfully retrieved number insight data'
      };
    } catch (error) {
      console.error('Error in NumberInsightAction:', error);
      return {
        success: false,
        data: null,
        message: `Error retrieving number insight data: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
