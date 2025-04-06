import AWS from 'aws-sdk';
import { SecretsManager, VonageCredentials } from '../../src/utils/secretsManager';

// Mock AWS SDK
jest.mock('aws-sdk', () => {
  const mockGetSecretValue = jest.fn();
  return {
    SecretsManager: jest.fn().mockImplementation(() => ({
      getSecretValue: mockGetSecretValue,
      promise: jest.fn()
    }))
  };
});

describe('SecretsManager', () => {
  let secretsManager: SecretsManager;
  const mockAwsSecretsManager = AWS.SecretsManager as jest.MockedClass<typeof AWS.SecretsManager>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    secretsManager = SecretsManager.getInstance();
    
    // Reset environment variables
    process.env.NODE_ENV = 'test';
    process.env.VONAGE_API_KEY = 'test_api_key';
    process.env.VONAGE_API_SECRET = 'test_api_secret';
  });
  
  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = SecretsManager.getInstance();
      const instance2 = SecretsManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
    
    it('should create a new instance with specified region', () => {
      const region = 'eu-west-1';
      const instance = SecretsManager.getInstance(region);
      
      expect(mockAwsSecretsManager).toHaveBeenCalledWith({ region });
    });
  });
  
  describe('getSecret', () => {
    it('should return secret from AWS Secrets Manager', async () => {
      const secretName = 'test/secret';
      const mockSecret = { key: 'value' };
      
      // Mock AWS SDK response
      const mockPromise = jest.fn().mockResolvedValue({
        SecretString: JSON.stringify(mockSecret)
      });
      
      const mockGetSecretValue = jest.fn().mockReturnValue({
        promise: mockPromise
      });
      
      (mockAwsSecretsManager.prototype.getSecretValue as jest.Mock) = mockGetSecretValue;
      
      const result = await secretsManager.getSecret(secretName);
      
      expect(mockGetSecretValue).toHaveBeenCalledWith({ SecretId: secretName });
      expect(result).toEqual(mockSecret);
    });
    
    it('should use cached secret on subsequent calls', async () => {
      const secretName = 'test/secret';
      const mockSecret = { key: 'value' };
      
      // Mock AWS SDK response
      const mockPromise = jest.fn().mockResolvedValue({
        SecretString: JSON.stringify(mockSecret)
      });
      
      const mockGetSecretValue = jest.fn().mockReturnValue({
        promise: mockPromise
      });
      
      (mockAwsSecretsManager.prototype.getSecretValue as jest.Mock) = mockGetSecretValue;
      
      // First call should fetch from AWS
      await secretsManager.getSecret(secretName);
      
      // Second call should use cache
      await secretsManager.getSecret(secretName);
      
      expect(mockGetSecretValue).toHaveBeenCalledTimes(1);
    });
    
    it('should force refresh when specified', async () => {
      const secretName = 'test/secret';
      const mockSecret = { key: 'value' };
      
      // Mock AWS SDK response
      const mockPromise = jest.fn().mockResolvedValue({
        SecretString: JSON.stringify(mockSecret)
      });
      
      const mockGetSecretValue = jest.fn().mockReturnValue({
        promise: mockPromise
      });
      
      (mockAwsSecretsManager.prototype.getSecretValue as jest.Mock) = mockGetSecretValue;
      
      // First call should fetch from AWS
      await secretsManager.getSecret(secretName);
      
      // Second call with forceRefresh should fetch again
      await secretsManager.getSecret(secretName, true);
      
      expect(mockGetSecretValue).toHaveBeenCalledTimes(2);
    });
    
    it('should handle SecretBinary format', async () => {
      const secretName = 'test/secret';
      const mockSecret = { key: 'value' };
      const secretBinary = Buffer.from(JSON.stringify(mockSecret)).toString('base64');
      
      // Mock AWS SDK response
      const mockPromise = jest.fn().mockResolvedValue({
        SecretBinary: secretBinary
      });
      
      const mockGetSecretValue = jest.fn().mockReturnValue({
        promise: mockPromise
      });
      
      (mockAwsSecretsManager.prototype.getSecretValue as jest.Mock) = mockGetSecretValue;
      
      const result = await secretsManager.getSecret(secretName);
      
      expect(result).toEqual(mockSecret);
    });
    
    it('should throw error when secret has no value', async () => {
      const secretName = 'test/secret';
      
      // Mock AWS SDK response with no value
      const mockPromise = jest.fn().mockResolvedValue({});
      
      const mockGetSecretValue = jest.fn().mockReturnValue({
        promise: mockPromise
      });
      
      (mockAwsSecretsManager.prototype.getSecretValue as jest.Mock) = mockGetSecretValue;
      
      await expect(secretsManager.getSecret(secretName)).rejects.toThrow(`Secret ${secretName} has no value`);
    });
    
    it('should use environment variables in test environment', async () => {
      const secretName = 'vonage/api-credentials';
      
      const result = await secretsManager.getSecret<VonageCredentials>(secretName);
      
      expect(result).toEqual({
        apiKey: 'test_api_key',
        apiSecret: 'test_api_secret'
      });
      
      // AWS SDK should not be called
      expect(mockAwsSecretsManager.prototype.getSecretValue).not.toHaveBeenCalled();
    });
  });
  
  describe('getVonageCredentials', () => {
    it('should return Vonage credentials', async () => {
      const mockCredentials = {
        apiKey: 'api_key',
        apiSecret: 'api_secret'
      };
      
      // Mock getSecret method
      jest.spyOn(secretsManager as any, 'getSecret').mockResolvedValue(mockCredentials);
      
      const result = await secretsManager.getVonageCredentials();
      
      expect(result).toEqual(mockCredentials);
    });
    
    it('should throw error for invalid credentials format', async () => {
      const invalidCredentials = {
        // Missing apiSecret
        apiKey: 'api_key'
      };
      
      // Mock getSecret method
      jest.spyOn(secretsManager as any, 'getSecret').mockResolvedValue(invalidCredentials);
      
      await expect(secretsManager.getVonageCredentials()).rejects.toThrow('Invalid Vonage credentials format in secret');
    });
  });
});
