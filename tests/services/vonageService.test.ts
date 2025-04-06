import axios from 'axios';
import { VonageService } from '../../src/services/vonageService';
import { SecretsManager } from '../../src/utils/secretsManager';

// Mock axios and SecretsManager
jest.mock('axios');
jest.mock('../../src/utils/secretsManager');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const MockedSecretsManager = SecretsManager as jest.MockedClass<typeof SecretsManager>;

describe('VonageService', () => {
  let vonageService: VonageService;
  const testPhoneNumber = '+12025550142';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock SecretsManager getInstance
    MockedSecretsManager.getInstance.mockReturnValue({
      getVonageCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test_api_key',
        apiSecret: 'test_api_secret'
      })
    } as unknown as SecretsManager);
    
    vonageService = new VonageService();
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
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('api_key=test_api_key'));
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('api_secret=test_api_secret'));
      
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
    it('should get credentials from SecretsManager', async () => {
      await vonageService.getAdvancedNumberInsight(testPhoneNumber);
      
      // Verify SecretsManager was used to get credentials
      const secretsManagerInstance = MockedSecretsManager.getInstance();
      expect(secretsManagerInstance.getVonageCredentials).toHaveBeenCalledTimes(1);
      expect(secretsManagerInstance.getVonageCredentials).toHaveBeenCalledWith('vonage/api-credentials');
    });
    
    it('should fall back to environment variables if SecretsManager fails', async () => {
      // Save original env vars
      const originalApiKey = process.env.VONAGE_API_KEY;
      const originalApiSecret = process.env.VONAGE_API_SECRET;
      
      // Set env vars
      process.env.VONAGE_API_KEY = 'env_api_key';
      process.env.VONAGE_API_SECRET = 'env_api_secret';
      
      // Mock SecretsManager to throw error
      MockedSecretsManager.getInstance.mockReturnValue({
        getVonageCredentials: jest.fn().mockRejectedValue(new Error('Secret not found'))
      } as unknown as SecretsManager);
      
      // Create new service instance
      const service = new VonageService();
      
      // Mock axios response
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: 0, country_name: 'Test' }
      });
      
      await service.getAdvancedNumberInsight(testPhoneNumber);
      
      // Verify axios was called with env var credentials
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('api_key=env_api_key') && 
        expect.stringContaining('api_secret=env_api_secret')
      );
      
      // Restore original env vars
      process.env.VONAGE_API_KEY = originalApiKey;
      process.env.VONAGE_API_SECRET = originalApiSecret;
    });
    
    it('should throw error when no credentials are available', async () => {
      // Save original env vars
      const originalApiKey = process.env.VONAGE_API_KEY;
      const originalApiSecret = process.env.VONAGE_API_SECRET;
      
      // Remove env vars
      delete process.env.VONAGE_API_KEY;
      delete process.env.VONAGE_API_SECRET;
      
      // Mock SecretsManager to throw error
      MockedSecretsManager.getInstance.mockReturnValue({
        getVonageCredentials: jest.fn().mockRejectedValue(new Error('Secret not found'))
      } as unknown as SecretsManager);
      
      // Create new service instance
      const service = new VonageService();
      
      // Expect error
      await expect(service.getAdvancedNumberInsight(testPhoneNumber))
        .rejects.toThrow('Vonage API credentials not found');
      
      // Restore original env vars
      process.env.VONAGE_API_KEY = originalApiKey;
      process.env.VONAGE_API_SECRET = originalApiSecret;
    });
  });
});
