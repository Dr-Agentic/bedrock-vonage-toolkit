import { Vonage } from '@vonage/server-sdk';
import { Verify } from '@vonage/verify';
import { SecretsManager } from '../utils/secretsManager';

/**
 * Interface for verification request options
 */
export interface VerifyRequestOptions {
  number: string;
  brand: string;
  workflow?: string[];
  locale?: string;
  codeLength?: number;
  pinExpiry?: number;
  nextEventWait?: number;
}

/**
 * Interface for verification request response
 */
export interface VerifyRequestResponse {
  requestId: string;
  status: 'success' | 'failed';
  errorCode?: string;
  errorText?: string;
  silentAuth?: boolean;
  nextStep?: string;
}

/**
 * Interface for verification check options
 */
export interface VerifyCheckOptions {
  requestId: string;
  code: string;
}

/**
 * Interface for verification check response
 */
export interface VerifyCheckResponse {
  requestId: string;
  status: 'success' | 'failed';
  errorCode?: string;
  errorText?: string;
  price?: string;
  currency?: string;
  timestamp: string;
}

/**
 * Interface for verification cancel response
 */
export interface VerifyCancelResponse {
  requestId: string;
  status: 'success' | 'failed';
  errorCode?: string;
  errorText?: string;
  timestamp: string;
}

/**
 * Service for phone number verification via Vonage
 */
export class VerifyService {
  private secretsManager: SecretsManager;
  private readonly secretName: string;
  
  /**
   * Constructor
   * @param secretName - Name of the secret containing Vonage credentials
   */
  constructor(secretName: string = 'vonage/api-credentials') {
    this.secretsManager = SecretsManager.getInstance();
    this.secretName = secretName;
  }
  
  /**
   * Request a verification code
   * @param options - Verification request options
   * @returns Promise with verification request response
   */
  async requestVerification(options: VerifyRequestOptions): Promise<VerifyRequestResponse> {
    try {
      console.log(`Requesting verification for number: ${options.number}`);
      
      // Get Vonage credentials from Secrets Manager
      const credentials = await this.getVonageCredentials();
      
      // Initialize Vonage client
      const vonage = new Vonage({
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret
      });
      
      const verify = new Verify(vonage);
      
      // Request verification
      const response = await verify.request({
        number: options.number,
        brand: options.brand,
        workflow: options.workflow,
        locale: options.locale,
        code_length: options.codeLength,
        pin_expiry: options.pinExpiry,
        next_event_wait: options.nextEventWait
      });
      
      console.log('Verification request response:', JSON.stringify(response, null, 2));
      
      // Format response
      return {
        requestId: response.request_id || '',
        status: response.status === '0' ? 'success' : 'failed',
        errorCode: response.error_text ? response.status : undefined,
        errorText: response.error_text || undefined,
        silentAuth: response.silent_auth === true,
        nextStep: response.next_step || null
      };
    } catch (error) {
      console.error('Error requesting verification:', error);
      throw error;
    }
  }
  
  /**
   * Check a verification code
   * @param options - Verification check options
   * @returns Promise with verification check response
   */
  async checkVerification(options: VerifyCheckOptions): Promise<VerifyCheckResponse> {
    try {
      console.log(`Checking verification code for request: ${options.requestId}`);
      
      // Get Vonage credentials from Secrets Manager
      const credentials = await this.getVonageCredentials();
      
      // Initialize Vonage client
      const vonage = new Vonage({
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret
      });
      
      const verify = new Verify(vonage);
      
      // Check verification code
      const response = await verify.check(options.requestId, options.code);
      
      console.log('Verification check response:', JSON.stringify(response, null, 2));
      
      // Format response
      return {
        requestId: options.requestId,
        status: response.status === '0' ? 'success' : 'failed',
        errorCode: response.error_text ? response.status : undefined,
        errorText: response.error_text || null,
        price: response.price || null,
        currency: response.currency || null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking verification code:', error);
      throw error;
    }
  }
  
  /**
   * Cancel a verification request
   * @param requestId - Verification request ID
   * @returns Promise with verification cancel response
   */
  async cancelVerification(requestId: string): Promise<VerifyCancelResponse> {
    try {
      console.log(`Cancelling verification request: ${requestId}`);
      
      // Get Vonage credentials from Secrets Manager
      const credentials = await this.getVonageCredentials();
      
      // Initialize Vonage client
      const vonage = new Vonage({
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret
      });
      
      const verify = new Verify(vonage);
      
      // Cancel verification request
      const response = await verify.cancel(requestId);
      
      console.log('Verification cancel response:', JSON.stringify(response, null, 2));
      
      // Format response
      return {
        requestId: requestId,
        status: response.status === '0' ? 'success' : 'failed',
        errorCode: response.error_text ? response.status : undefined,
        errorText: response.error_text || null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error cancelling verification:', error);
      throw error;
    }
  }
  
  /**
   * Get Vonage credentials from Secrets Manager
   * @returns Promise with API key and secret
   */
  private async getVonageCredentials(): Promise<{ apiKey: string; apiSecret: string }> {
    try {
      return await this.secretsManager.getVonageCredentials(this.secretName);
    } catch (error) {
      console.error('Error getting Vonage credentials:', error);
      
      // Fallback to environment variables if available (for backward compatibility)
      if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET) {
        console.log('Using Vonage credentials from environment variables');
        return {
          apiKey: process.env.VONAGE_API_KEY,
          apiSecret: process.env.VONAGE_API_SECRET
        };
      }
      
      throw new Error('Vonage API credentials not found');
    }
  }
}
