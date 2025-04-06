import { Vonage } from '@vonage/server-sdk';
import { SMS } from '@vonage/sms';
import { SecretsManager } from '../utils/secretsManager';

/**
 * Interface for SMS message options
 */
export interface SmsOptions {
  from: string;
  to: string;
  text: string;
  type?: 'text' | 'binary' | 'unicode';
  ttl?: number;
  statusReportReq?: boolean;
  webhookUrl?: string;
  webhookType?: 'json' | 'form';
  messageClass?: 0 | 1 | 2 | 3;
}

/**
 * Interface for SMS response
 */
export interface SmsResponse {
  messageId: string;
  to: string;
  from: string;
  status: 'success' | 'failed';
  errorCode?: string;
  errorMessage?: string;
  remainingBalance?: string;
  messagePrice?: string;
  network?: string;
  timestamp: string;
}

/**
 * Service for sending SMS messages via Vonage
 */
export class SmsService {
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
   * Send an SMS message
   * @param options - SMS message options
   * @returns Promise with SMS response
   */
  async sendSms(options: SmsOptions): Promise<SmsResponse> {
    try {
      console.log(`Sending SMS from ${options.from} to ${options.to}`);
      
      // Get Vonage credentials from Secrets Manager
      const credentials = await this.getVonageCredentials();
      
      // Initialize Vonage client
      const vonage = new Vonage({
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret
      });
      
      const sms = new SMS(vonage);
      
      // Send SMS
      const response = await sms.send({
        from: options.from,
        to: options.to,
        text: options.text,
        type: options.type || 'text',
        ttl: options.ttl,
        statusReportReq: options.statusReportReq,
        webhookUrl: options.webhookUrl,
        webhookType: options.webhookType,
        messageClass: options.messageClass
      });
      
      console.log('SMS response:', JSON.stringify(response, null, 2));
      
      // Format response
      return {
        messageId: response.messageId || '',
        to: options.to,
        from: options.from,
        status: response.status === '0' ? 'success' : 'failed',
        errorCode: response.errorCode || undefined,
        errorMessage: response.errorText || undefined,
        remainingBalance: response.remainingBalance || undefined,
        messagePrice: response.messagePrice || undefined,
        network: response.network || undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
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
