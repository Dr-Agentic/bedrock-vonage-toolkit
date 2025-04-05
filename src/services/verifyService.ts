import vonageClient from '../config/vonage';

/**
 * Service for interacting with Vonage Verify API
 */
export class VerifyService {
  /**
   * Request a verification code to be sent to a phone number
   * 
   * @param number - Phone number to verify (E.164 format)
   * @param brand - Name of your brand/application
   * @param codeLength - Length of the verification code (default: 4)
   * @param locale - Locale for the verification message (default: en-us)
   * @param channel - Preferred channel for verification (default: sms)
   * @returns Promise with verification request details
   */
  async requestVerification(
    number: string, 
    brand: string,
    codeLength: number = 4,
    locale: string = 'en-us',
    channel: 'sms' | 'voice' | 'whatsapp' = 'sms'
  ) {
    try {
      console.log(`Requesting verification for number: ${number}, brand: ${brand}, channel: ${channel}`);
      
      // Call the Vonage Verify API
      const verifyRequest: any = await new Promise((resolve, reject) => {
        vonageClient.verify.request({
          number,
          brand,
          code_length: codeLength,
          lg: locale,
          // Don't include channel parameter as it's not supported in this version
        }, (err: any, result: any) => {
          if (err) {
            console.error('Error requesting verification:', err);
            reject(err);
          } else {
            console.log('Verification request response:', JSON.stringify(result, null, 2));
            resolve(result);
          }
        });
      });
      
      // Format the response
      return {
        requestId: verifyRequest.request_id,
        status: {
          code: verifyRequest.status,
          message: this.getStatusMessage(verifyRequest.status)
        },
        estimatedPrice: verifyRequest.network ? {
          amount: verifyRequest.network.price,
          currency: verifyRequest.network.currency
        } : undefined,
        remainingBalance: verifyRequest.network ? verifyRequest.network.remaining_balance : undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in requestVerification:', error);
      throw error;
    }
  }

  /**
   * Check a verification code that was submitted by the user
   * 
   * @param requestId - The request_id from the initial verification request
   * @param code - The verification code entered by the user
   * @returns Promise with verification check results
   */
  async checkVerification(requestId: string, code: string) {
    try {
      console.log(`Checking verification code for request: ${requestId}, code: ${code}`);
      
      // Call the Vonage Verify API to check the code
      const checkResult: any = await new Promise((resolve, reject) => {
        vonageClient.verify.check({
          request_id: requestId,
          code
        }, (err: any, result: any) => {
          if (err) {
            console.error('Error checking verification code:', err);
            reject(err);
          } else {
            console.log('Verification check response:', JSON.stringify(result, null, 2));
            resolve(result);
          }
        });
      });
      
      // Format the response
      return {
        requestId: checkResult.request_id,
        status: {
          code: checkResult.status,
          message: this.getStatusMessage(checkResult.status)
        },
        price: checkResult.price,
        currency: checkResult.currency,
        estimatedPriceMessages: checkResult.estimated_price_messages_sent,
        verified: checkResult.status === '0',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in checkVerification:', error);
      throw error;
    }
  }

  /**
   * Cancel an ongoing verification request
   * 
   * @param requestId - The request_id from the initial verification request
   * @returns Promise with cancellation results
   */
  async cancelVerification(requestId: string) {
    try {
      console.log(`Cancelling verification request: ${requestId}`);
      
      // Call the Vonage Verify API to cancel the request
      const cancelResult: any = await new Promise((resolve, reject) => {
        vonageClient.verify.control({
          request_id: requestId,
          cmd: 'cancel'
        }, (err: any, result: any) => {
          if (err) {
            console.error('Error cancelling verification:', err);
            reject(err);
          } else {
            console.log('Verification cancel response:', JSON.stringify(result, null, 2));
            resolve(result);
          }
        });
      });
      
      // Format the response
      return {
        requestId: cancelResult.request_id || requestId,
        status: {
          code: cancelResult.status,
          message: this.getStatusMessage(cancelResult.status)
        },
        cancelled: cancelResult.status === '0',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in cancelVerification:', error);
      throw error;
    }
  }

  /**
   * Get a human-readable message for Vonage Verify API status codes
   * 
   * @param status - The status code from the Vonage API
   * @returns A human-readable message
   */
  private getStatusMessage(status: string): string {
    const statusMessages: {[key: string]: string} = {
      '0': 'Success',
      '1': 'Throttled',
      '2': 'Missing parameters',
      '3': 'Invalid parameters',
      '4': 'Invalid credentials',
      '5': 'Internal error',
      '6': 'Request not found',
      '7': 'Network error',
      '8': 'Number barred',
      '9': 'Partner account barred',
      '10': 'Partner quota exceeded',
      '11': 'Code expired',
      '12': 'Already verified',
      '13': 'Code invalid',
      '14': 'Verification rejected',
      '15': 'Verification too recent',
      '16': 'Verification not found',
      '17': 'Verification expired',
      '18': 'Verification failed',
      '19': 'Verification pending',
      '20': 'Maximum attempts reached',
      '101': 'Invalid request'
    };
    
    return statusMessages[status] || `Unknown status: ${status}`;
  }
}
