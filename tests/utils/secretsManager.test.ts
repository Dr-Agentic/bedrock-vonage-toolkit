import AWS from 'aws-sdk';
import { SecretsManager, VonageCredentials } from '../../src/utils/secretsManager';

// Mock AWS SDK
jest.mock('aws-sdk', () => {
  const mockGetSecretValuePromise = jest.fn();
  return {
    SecretsManager: jest.fn().mockImplementation(() => ({
      getSecretValue: jest.fn().mockReturnValue({
        promise: mockGetSecretValuePromise
      })
    }))
  };
});

describe('SecretsManager', () => {
  let secretsManager: SecretsManager;
  let mockAwsSecretsManager: any;
  let mockGetSecretValuePromise: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the singleton instance for each test
    (SecretsManager as any).instance = undefined;
    
    // Get the mocked AWS.SecretsManager constructor
    mockAwsSecretsManager = AWS.SecretsManager as jest.MockedClass<typeof AWS.SecretsManager>;
    
    // Get the mocked promise function
    const mockInstance = (mockAwsSecretsManager as jest.Mock).mock.results[0]?.value;
    mockGetSecretValuePromise = mockInstance?.getSecretValue().promise;
    
    // Create a new instance for testing
    secretsManager = SecretsManager.getInstance();
  });
  
  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = SecretsManager.getInstance();
      const instance2 = SecretsManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
    
    it('should create a new instance with specified region', () => {
      const region = 'eu-west-1';
      
      // Reset the singleton instance
      (SecretsManager as any).instance = undefined;
      
      // Create a new instance with the specified region
      SecretsManager.getInstance(region);
      
      // Check that AWS.SecretsManager was constructed with the correct region
      expect(mockAwsSecretsManager).toHaveBeenCalledWith({ region });
    });
  });
  
  describe('getSecret', () => {
    it('should return secret from AWS Secrets Manager', async () => {
      const secretName = 'test/secret';
      const mockSecret = { key: 'value' };
      
      // Mock the AWS SDK response
      mockGetSecretValuePromise.mockResolvedValueOnce({
        SecretString: JSON.stringify(mockSecret)
      });
      
      const result = await secretsManager.getSecret(secretName);
      
      // Verify AWS SDK was called correctly
      expect(mockAwsSecretsManager.mock.instances[0].getSecretValue)
        .toHaveBeenCalledWith({ SecretId: secretName });
      
      expect(result).toEqual(mockSecret);
    });
    
    it('should use cached secret on subsequent calls', async () => {
      const secretName = 'test/secret';
      const mockSecret = { key: 'value' };
      
      // Mock the AWS SDK response
      mockGetSecretValuePromise.mockResolvedValueOnce({
        SecretString: JSON.stringify(mockSecret)
      });
      
      // First call should fetch from AWS
      await secretsManager.getSecret(secretName);
      
      // Second call should use cache
      await secretsManager.getSecret(secretName);
      
      // Verify AWS SDK was called only once
      expect(mockGetSecretValuePromise).toHaveBeenCalledTimes(1);
    });
    
    it('should force refresh when specified', async () => {
      const secretName = 'test/secret';
      const mockSecret = { key: 'value' };
      
      // Mock the AWS SDK response
      mockGetSecretValuePromise.mockResolvedValueOnce({
        SecretString: JSON.stringify(mockSecret)
      });
      mockGetSecretValuePromise.mockResolvedValueOnce({
        SecretString: JSON.stringify({ key: 'updated' })
      });
      
      // First call should fetch from AWS
      await secretsManager.getSecret(secretName);
      
      // Second call with forceRefresh should fetch again
      const result = await secretsManager.getSecret(secretName, true);
      
      // Verify AWS SDK was called twice
      expect(mockGetSecretValuePromise).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ key: 'updated' });
    });
    
    it('should handle SecretBinary format', async () => {
      const secretName = 'test/secret';
      const mockSecret = { key: 'value' };
      const secretBinary = Buffer.from(JSON.stringify(mockSecret)).toString('base64');
      
      // Mock the AWS SDK response
      mockGetSecretValuePromise.mockResolvedValueOnce({
        SecretBinary: secretBinary
      });
      
      const result = await secretsManager.getSecret(secretName);
      
      expect(result).toEqual(mockSecret);
    });
    
    it('should throw error when secret has no value', async () => {
      const secretName = 'test/secret';
      
      // Mock AWS SDK response with no value
      mockGetSecretValuePromise.mockResolvedValueOnce({});
      
      await expect(secretsManager.getSecret(secretName)).rejects.toThrow(`Secret ${secretName} has no value`);
    });
    
    it('should use environment variables in test environment', async () => {
      const secretName = 'vonage/api-credentials';
      
      // Set environment variables
      process.env.VONAGE_API_KEY = 'test_api_key';
      process.env.VONAGE_API_SECRET = 'test_api_secret';
      process.env.NODE_ENV = 'test';
      
      const result = await secretsManager.getSecret<VonageCredentials>(secretName);
      
      expect(result).toEqual({
        apiKey: 'test_api_key',
        apiSecret: 'test_api_secret'
      });
      
      // AWS SDK should not be called
      expect(mockGetSecretValuePromise).not.toHaveBeenCalled();
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
