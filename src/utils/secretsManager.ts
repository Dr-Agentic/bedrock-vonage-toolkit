import { 
  SecretsManagerClient, 
  GetSecretValueCommand,
  GetSecretValueCommandOutput
} from '@aws-sdk/client-secrets-manager';

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
  private client: SecretsManagerClient;
  private static instance: SecretsManager;
  private cachedSecrets: Record<string, any> = {};
  private cacheExpiry: Record<string, number> = {};
  private readonly CACHE_TTL_MS = 3600000; // 1 hour cache

  /**
   * Constructor
   * @param region - AWS region
   */
  private constructor(region: string = process.env.AWS_REGION || 'us-east-1') {
    this.client = new SecretsManagerClient({ region });
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
      
      // Always check for environment variables as a fallback
      const localSecret = this.getLocalSecret<T>(secretName);
      if (localSecret) {
        console.log(`Using environment variables for ${secretName}`);
        return localSecret;
      }
      
      // Create the command
      const command = new GetSecretValueCommand({
        SecretId: secretName
      });
      
      // Execute the command
      const response: GetSecretValueCommandOutput = await this.client.send(command);
      let secretValue: T;
      
      if (response.SecretString) {
        secretValue = JSON.parse(response.SecretString) as T;
      } else if (response.SecretBinary) {
        const buff = Buffer.from(response.SecretBinary as Uint8Array);
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
      
      // Final fallback to environment variables
      const localSecret = this.getLocalSecret<T>(secretName);
      if (localSecret) {
        console.log(`Fallback to environment variables for ${secretName} after error`);
        return localSecret;
      }
      
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
      // First try with the provided secret name
      try {
        const credentials = await this.getSecret<VonageCredentials>(secretName);
        
        if (credentials.apiKey && credentials.apiSecret) {
          return credentials;
        }
      } catch (error) {
        console.log(`Could not get credentials from ${secretName}, trying fallbacks`);
      }
      
      // Try with stage-specific secret name
      const stage = process.env.NODE_ENV || 'dev';
      try {
        const stageSecretName = `${secretName}-${stage}`;
        console.log(`Trying stage-specific secret: ${stageSecretName}`);
        const credentials = await this.getSecret<VonageCredentials>(stageSecretName);
        
        if (credentials.apiKey && credentials.apiSecret) {
          return credentials;
        }
      } catch (error) {
        console.log(`Could not get credentials from stage-specific secret, trying environment variables`);
      }
      
      // Final fallback to environment variables
      if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET) {
        console.log('Using Vonage credentials from environment variables');
        return {
          apiKey: process.env.VONAGE_API_KEY,
          apiSecret: process.env.VONAGE_API_SECRET
        };
      }
      
      throw new Error('Vonage API credentials not found in any location');
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
    if (secretName.includes('vonage/api-credentials')) {
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
