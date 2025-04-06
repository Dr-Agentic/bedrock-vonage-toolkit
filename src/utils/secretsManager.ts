import AWS from 'aws-sdk';

/**
 * Interface for Vonage credentials
 */
export interface VonageCredentials {
  apiKey: string;
  apiSecret: string;
}

/**
 * Interface for all secrets
 */
export interface AppSecrets {
  vonage: VonageCredentials;
  // Add other secret types as needed
}

/**
 * Utility class for interacting with AWS Secrets Manager
 */
export class SecretsManager {
  private secretsManager: AWS.SecretsManager;
  private static instance: SecretsManager;
  private cachedSecrets: Record<string, any> = {};
  private cacheExpiry: Record<string, number> = {};
  private readonly CACHE_TTL_MS = 3600000; // 1 hour cache

  /**
   * Constructor
   * @param region - AWS region
   */
  private constructor(region: string = process.env.AWS_REGION || 'us-east-1') {
    this.secretsManager = new AWS.SecretsManager({ region });
  }

  /**
   * Get singleton instance
   * @param region - AWS region
   * @returns SecretsManager instance
   */
  public static getInstance(region?: string): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager(region);
    }
    return SecretsManager.instance;
  }

  /**
   * Get a secret value from AWS Secrets Manager
   * @param secretName - Name of the secret
   * @param forceRefresh - Force refresh the cache
   * @returns Promise with the secret value
   */
  public async getSecret<T>(secretName: string, forceRefresh = false): Promise<T> {
    const now = Date.now();
    
    // Return cached value if available and not expired
    if (
      !forceRefresh &&
      this.cachedSecrets[secretName] &&
      this.cacheExpiry[secretName] > now
    ) {
      console.log(`Using cached secret for ${secretName}`);
      return this.cachedSecrets[secretName] as T;
    }

    try {
      console.log(`Fetching secret ${secretName} from AWS Secrets Manager`);
      
      // For local development/testing, use environment variables if secret name matches pattern
      if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
        const localSecret = this.getLocalSecret<T>(secretName);
        if (localSecret) {
          console.log(`Using local secret for ${secretName} in ${process.env.NODE_ENV} environment`);
          return localSecret;
        }
      }
      
      const params = {
        SecretId: secretName
      };
      
      const data = await this.secretsManager.getSecretValue(params).promise();
      let secretValue: T;
      
      if (data.SecretString) {
        secretValue = JSON.parse(data.SecretString) as T;
      } else if (data.SecretBinary) {
        const buff = Buffer.from(data.SecretBinary as string, 'base64');
        secretValue = JSON.parse(buff.toString('ascii')) as T;
      } else {
        throw new Error(`Secret ${secretName} has no value`);
      }
      
      // Cache the secret
      this.cachedSecrets[secretName] = secretValue;
      this.cacheExpiry[secretName] = now + this.CACHE_TTL_MS;
      
      return secretValue;
    } catch (error) {
      console.error(`Error fetching secret ${secretName}:`, error);
      throw error;
    }
  }
  
  /**
   * Get Vonage credentials from AWS Secrets Manager
   * @param secretName - Name of the secret containing Vonage credentials
   * @returns Promise with Vonage credentials
   */
  public async getVonageCredentials(secretName: string = 'vonage/api-credentials'): Promise<VonageCredentials> {
    try {
      const credentials = await this.getSecret<VonageCredentials>(secretName);
      
      if (!credentials.apiKey || !credentials.apiSecret) {
        throw new Error('Invalid Vonage credentials format in secret');
      }
      
      return credentials;
    } catch (error) {
      console.error('Error fetching Vonage credentials:', error);
      throw error;
    }
  }
  
  /**
   * Get a secret from local environment variables (for development/testing)
   * @param secretName - Name of the secret
   * @returns Secret value or null if not found
   */
  private getLocalSecret<T>(secretName: string): T | null {
    // Handle specific secret types
    if (secretName === 'vonage/api-credentials') {
      if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET) {
        return {
          apiKey: process.env.VONAGE_API_KEY,
          apiSecret: process.env.VONAGE_API_SECRET
        } as unknown as T;
      }
    }
    
    // Add more secret types as needed
    
    return null;
  }
}
