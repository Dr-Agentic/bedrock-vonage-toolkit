import axios from 'axios';
import { VonageService } from '../../src/services/vonageService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VonageService', () => {
  let vonageService: VonageService;
  const testPhoneNumber = '+12025550142';
  
  beforeEach(() => {
    vonageService = new VonageService();
    jest.clearAllMocks();
  });
  
  describe('getAdvancedNumberInsight', () => {
    it('should return formatted number insight data', async () => {
      // Mock successful API response
      const mockResponse = {
        data: {
          status: 0,
          status_message: 'Success',
          request_id: 'test-request-id',
          international_format_number: '12025550142',
          national_format_number: '(202) 555-0142',
          country_code: 'US',
          country_code_iso3: 'USA',
          country_name: 'United States of America',
          country_prefix: '1',
          request_price: '0.03000000',
          remaining_balance: '10.00000000',
          ported: 'ported',
          current_carrier: {
            network_code: 'US-UNKNOWN',
            name: 'United States Unknown',
            country: 'US',
            network_type: 'mobile'
          },
          original_carrier: {
            network_code: '310090',
            name: 'AT&T Mobility',
            country: 'US',
            network_type: 'mobile'
          },
          roaming: 'unknown',
          valid_number: 'valid',
          reachable: 'unknown',
          lookup_outcome: 0,
          lookup_outcome_message: 'Success'
        }
      };
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await vonageService.getAdvancedNumberInsight(testPhoneNumber);
      
      // Verify axios was called with correct URL
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('api.nexmo.com/ni/advanced/json'));
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining(`number=${testPhoneNumber}`));
      
      // Verify the returned data is formatted correctly
      expect(result).toHaveProperty('phoneNumber', testPhoneNumber);
      expect(result).toHaveProperty('basicInfo');
      expect(result.basicInfo).toHaveProperty('countryName', 'United States of America');
      expect(result).toHaveProperty('carrierInfo');
      expect(result.carrierInfo).toHaveProperty('name', 'United States Unknown');
      expect(result).toHaveProperty('validity');
      expect(result.validity).toHaveProperty('valid', true);
      expect(result.validity).toHaveProperty('ported', true);
      expect(result).toHaveProperty('advancedDetails');
      expect(result.advancedDetails.portingInfo).toHaveProperty('originalNetwork', 'AT&T Mobility');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('rawData');
    });
    
    it('should handle API errors gracefully', async () => {
      // Mock API error
      const errorMessage = 'API request failed';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      // Verify the error is propagated
      await expect(vonageService.getAdvancedNumberInsight(testPhoneNumber))
        .rejects.toThrow(errorMessage);
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    
    it('should handle missing carrier information', async () => {
      // Mock response with missing carrier info
      const mockResponse = {
        data: {
          status: 0,
          status_message: 'Success',
          international_format_number: '12025550142',
          national_format_number: '(202) 555-0142',
          country_code: 'US',
          country_name: 'United States of America',
          country_prefix: '1',
          valid_number: 'valid'
          // Missing carrier info
        }
      };
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await vonageService.getAdvancedNumberInsight(testPhoneNumber);
      
      // Verify default values are used for missing fields
      expect(result.carrierInfo.name).toBe('Unknown');
      expect(result.advancedDetails.portingInfo.originalNetwork).toBe('unknown');
    });
  });
  
  describe('getVonageCredentials', () => {
    it('should return credentials from environment variables', async () => {
      // Use the private method through a public method
      const result = await vonageService.getAdvancedNumberInsight(testPhoneNumber);
      
      // The test will fail if credentials aren't found, so if we get here, it worked
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('api_key=') && expect.stringContaining('api_secret=')
      );
    });
    
    it('should throw error when credentials are not available', async () => {
      // Temporarily remove environment variables
      const originalApiKey = process.env.VONAGE_API_KEY;
      const originalApiSecret = process.env.VONAGE_API_SECRET;
      delete process.env.VONAGE_API_KEY;
      delete process.env.VONAGE_API_SECRET;
      
      // Expect the service to throw an error
      await expect(vonageService.getAdvancedNumberInsight(testPhoneNumber))
        .rejects.toThrow('Vonage API credentials not found');
      
      // Restore environment variables
      process.env.VONAGE_API_KEY = originalApiKey;
      process.env.VONAGE_API_SECRET = originalApiSecret;
    });
  });
});
