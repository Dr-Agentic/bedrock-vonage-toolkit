import { NumberInsightAction } from '../../src/actions/numberInsightAction';
import { VonageService } from '../../src/services/vonageService';

// Mock VonageService
jest.mock('../../src/services/vonageService');

describe('NumberInsightAction', () => {
  let numberInsightAction: NumberInsightAction;
  let mockVonageService: jest.Mocked<VonageService>;
  const testPhoneNumber = '+12025550142';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mocked VonageService
    mockVonageService = {
      getAdvancedNumberInsight: jest.fn()
    } as unknown as jest.Mocked<VonageService>;
    
    numberInsightAction = new NumberInsightAction(mockVonageService);
  });
  
  describe('execute', () => {
    it('should return number insight data for valid phone number', async () => {
      // Mock the VonageService response
      const mockInsightData = {
        phoneNumber: testPhoneNumber,
        basicInfo: {
          internationalFormat: '12025550142',
          nationalFormat: '(202) 555-0142',
          countryCode: 'US',
          countryName: 'United States of America',
          countryPrefix: '1'
        },
        carrierInfo: {
          name: 'Test Carrier',
          country: 'US',
          networkType: 'mobile',
          networkCode: 'TEST'
        },
        validity: {
          valid: true,
          reachable: true,
          ported: false,
          roaming: false
        },
        advancedDetails: {
          roamingInfo: {
            status: 'not_roaming',
            countryCode: '',
            networkName: '',
            networkCode: ''
          },
          portingInfo: {
            status: 'not_ported',
            originalNetwork: ''
          },
          callerIdentity: {
            callerName: 'Test User',
            callerType: 'consumer',
            firstName: 'Test',
            lastName: 'User'
          }
        },
        riskScore: {
          score: 10,
          recommendation: 'allow'
        },
        timestamp: new Date().toISOString(),
        rawData: {}
      };
      
      mockVonageService.getAdvancedNumberInsight.mockResolvedValue(mockInsightData);
      
      const result = await numberInsightAction.execute({ phoneNumber: testPhoneNumber });
      
      expect(mockVonageService.getAdvancedNumberInsight).toHaveBeenCalledWith(testPhoneNumber);
      expect(result).toEqual({
        success: true,
        data: mockInsightData,
        message: 'Successfully retrieved number insight data'
      });
    });
    
    it('should handle invalid phone number', async () => {
      const invalidNumber = '1234';
      
      const result = await numberInsightAction.execute({ phoneNumber: invalidNumber });
      
      expect(mockVonageService.getAdvancedNumberInsight).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        data: null,
        message: 'Invalid phone number format. Please use E.164 format (e.g., +12025550142)'
      });
    });
    
    it('should handle API errors', async () => {
      const errorMessage = 'API request failed';
      mockVonageService.getAdvancedNumberInsight.mockRejectedValue(new Error(errorMessage));
      
      const result = await numberInsightAction.execute({ phoneNumber: testPhoneNumber });
      
      expect(mockVonageService.getAdvancedNumberInsight).toHaveBeenCalledWith(testPhoneNumber);
      expect(result).toEqual({
        success: false,
        data: null,
        message: `Error retrieving number insight data: ${errorMessage}`
      });
    });
  });
});
