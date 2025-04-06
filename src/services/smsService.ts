import { getSmsClient } from '../config/vonage';

/**
 * Service for sending SMS messages using Vonage API
 */
export class SmsService {
  /**
   * Send an SMS message to a phone number
   * 
   * @param from - Sender ID or phone number (must be enabled in your Vonage account)
   * @param to - Recipient phone number in E.164 format (e.g., +12025550123)
   * @param text - Message content
   * @param options - Additional SMS options (type, ttl, etc.)
   * @returns Promise with SMS sending results
   */
  async sendSms(
    from: string,
    to: string,
    text: string,
    options: {
      type?: 'text' | 'unicode' | 'binary',
      ttl?: number,
      statusReportReq?: boolean,
      webhookUrl?: string,
      webhookMethod?: 'GET' | 'POST',
      clientRef?: string
    } = {}
  ) {
    try {
      console.log(`Sending SMS from ${from} to ${to}`);
      
      // Get the SMS client
      const sms = await getSmsClient();
      
      // Prepare SMS parameters
      const smsParams: any = {
        from,
        to,
        text,
        type: options.type || 'text'
      };
      
      // Add optional parameters if they exist
      if (options.ttl) smsParams.ttl = options.ttl;
      if (options.statusReportReq !== undefined) smsParams.statusReportReq = options.statusReportReq;
      if (options.webhookUrl) smsParams.callback = options.webhookUrl;
      if (options.webhookMethod) smsParams.callbackMethod = options.webhookMethod;
      if (options.clientRef) smsParams.clientRef = options.clientRef;
      
      // Send SMS using Vonage API
      const response = await sms.send(smsParams);
      console.log('SMS sent successfully:', JSON.stringify(response, null, 2));
      
      // Format the response
      return this.formatSmsResponse(response);
    } catch (error) {
      console.error('Error in sendSms:', error);
      throw error;
    }
  }
  
  /**
   * Format the SMS API response into a more user-friendly structure
   * 
   * @param response - Raw response from Vonage API
   * @returns Formatted SMS response
   */
  private formatSmsResponse(response: any) {
    // Handle array of messages (Vonage API returns an array)
    const messages = Array.isArray(response.messages) ? response.messages : [response];
    
    // Get the first message (most common case)
    const message = messages[0];
    
    // Format the response
    return {
      messageId: message.messageId || message.message_id || 'unknown',
      to: message.to,
      status: {
        code: message.status,
        message: this.getSmsStatusMessage(message.status)
      },
      remainingBalance: message.remainingBalance || message.remaining_balance,
      messagePrice: message.messagePrice || message.message_price,
      network: message.network,
      deliveryStatus: message.errorText || message['error-text'] ? 'failed' : 'sent',
      errorMessage: message.errorText || message['error-text'],
      timestamp: new Date().toISOString(),
      messageCount: messages.length
    };
  }
  
  /**
   * Get a human-readable message for Vonage SMS API status codes
   * 
   * @param status - The status code from the Vonage API
   * @returns A human-readable message
   */
  private getSmsStatusMessage(status: string): string {
    const statusMessages: {[key: string]: string} = {
      '0': 'Success',
      '1': 'Throttled',
      '2': 'Missing parameters',
      '3': 'Invalid parameters',
      '4': 'Invalid credentials',
      '5': 'Internal error',
      '6': 'Invalid message',
      '7': 'Number barred',
      '8': 'Partner account barred',
      '9': 'Partner quota exceeded',
      '10': 'Too many existing binds',
      '11': 'Account not enabled for REST',
      '12': 'Message too long',
      '13': 'Communication failed',
      '14': 'Invalid signature',
      '15': 'Invalid sender address',
      '16': 'Invalid TTL',
      '19': 'Facility not allowed',
      '20': 'Invalid message class',
      '23': 'Bad callback URL',
      '29': 'Non-whitelisted destination',
      '34': 'Invalid or missing msisdn parameter'
    };
    
    return statusMessages[status] || `Unknown status: ${status}`;
  }
}
