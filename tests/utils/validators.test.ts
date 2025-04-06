import { validatePhoneNumber, validateApiCredentials } from '../../src/utils/validators';

describe('Validators', () => {
  describe('validatePhoneNumber', () => {
    it('should validate correct E.164 phone numbers', () => {
      const validNumbers = [
        '+12025550142',
        '+447700900123',
        '+33123456789',
        '+61412345678'
      ];
      
      validNumbers.forEach(number => {
        expect(validatePhoneNumber(number)).toBe(true);
      });
    });
    
    it('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        '12025550142', // missing plus
        '+1202555', // too short
        '+1202555abcd', // contains letters
        '++12025550142', // double plus
        '', // empty string
        '+', // just plus
        '123' // too short without plus
      ];
      
      invalidNumbers.forEach(number => {
        expect(validatePhoneNumber(number)).toBe(false);
      });
    });
  });
  
  describe('validateApiCredentials', () => {
    it('should validate correct API credentials', () => {
      const validCredentials = [
        { apiKey: 'abc123', apiSecret: 'xyz789' },
        { apiKey: '12345678901234567890', apiSecret: '12345678901234567890' }
      ];
      
      validCredentials.forEach(creds => {
        expect(validateApiCredentials(creds.apiKey, creds.apiSecret)).toBe(true);
      });
    });
    
    it('should reject invalid API credentials', () => {
      const invalidCredentials = [
        { apiKey: '', apiSecret: 'xyz789' }, // empty apiKey
        { apiKey: 'abc123', apiSecret: '' }, // empty apiSecret
        { apiKey: '', apiSecret: '' }, // both empty
        { apiKey: null, apiSecret: 'xyz789' }, // null apiKey
        { apiKey: 'abc123', apiSecret: null } // null apiSecret
      ];
      
      invalidCredentials.forEach(creds => {
        expect(validateApiCredentials(creds.apiKey as string, creds.apiSecret as string)).toBe(false);
      });
    });
  });
});
