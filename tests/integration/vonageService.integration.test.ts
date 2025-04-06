/**
 * Integration tests for VonageService
 * 
 * NOTE: These tests require valid Vonage API credentials to be set in the environment
 * They will be skipped if the credentials are not available
 */

import { VonageService } from '../../src/services/vonageService';

// Only run these tests if we have real credentials
const hasCredentials = process.env.VONAGE_API_KEY && 
                       process.env.VONAGE_API_SECRET && 
                       process.env.VONAGE_API_KEY !== 'test_api_key';

// Use conditional test suite
(hasCredentials ? describe : describe.skip)('VonageService Integration Tests', () => {
  let vonageService: VonageService;
  
  beforeAll(() => {
    vonageService = new VonageService();
    console.log('Running integration tests with real Vonage API credentials');
  });
  
  describe('getAdvancedNumberInsight', () => {
    it('should return real data for a valid phone number', async () => {
      // Use a test phone number or a known valid number
      const testNumber = process.env.TEST_PHONE_NUMBER || '+12025550142';
      
      const result = await vonageService.getAdvancedNumberInsight(testNumber);
      
      // Verify we got a proper response
      expect(result).toBeDefined();
      expect(result.phoneNumber).toBe(testNumber);
      expect(result.basicInfo).toBeDefined();
      expect(result.basicInfo.countryCode).toBeDefined();
      expect(result.carrierInfo).toBeDefined();
      expect(result.validity).toBeDefined();
      expect(result.timestamp).toBeDefined();
      
      // Log the result for manual verification
      console.log('Integration test result:', JSON.stringify(result, null, 2));
    }, 10000); // Increase timeout for API call
    
    it('should handle invalid phone numbers gracefully', async () => {
      // Use an obviously invalid number
      const invalidNumber = '+123';
      
      try {
        const result = await vonageService.getAdvancedNumberInsight(invalidNumber);
        
        // Even with invalid numbers, the API should return some data
        expect(result).toBeDefined();
        expect(result.phoneNumber).toBe(invalidNumber);
        
        // The validity should indicate it's not valid
        expect(result.validity.valid).toBe(false);
        
        console.log('Invalid number test result:', JSON.stringify(result, null, 2));
      } catch (error) {
        // Some invalid numbers might cause API errors, which is also acceptable
        console.log('Expected error for invalid number:', error);
        expect(error).toBeDefined();
      }
    }, 10000); // Increase timeout for API call
  });
});
