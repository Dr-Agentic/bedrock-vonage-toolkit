import { getVerifyClient } from '../config/vonage';

/**
 * Service for phone number verification using Vonage Verify API
 */
export class VerifyService {
  /**
   * Request a verification code to be sent to a phone number
   * 
   * @param number - Phone number to verify in E.164 format (e.g., +12025550123)
   * @param brand - Name of your brand or application (displayed to the user)
   * @param options - Additional verification options
   * @returns Promise with verification request result
   */
  async requestVerification(
    number: string,
    brand: string,
    options: {
      codeLength?: number,
      locale?: string,
      workflowId?: number,
      pinExpiry?: number
    } = {}
  ) {
    try {
      console.log(`Requesting verification for number: ${number}`);
      
      // Get the Verify client
      const verify = await getVerifyClient();
      
      // Prepare verification parameters
      const verifyParams: any = {
        number,
        brand
      };
      
      // Add optional parameters if they exist
      if (options.codeLength) verifyParams.codeLength = options.codeLength;
      if (options.locale) verifyParams.locale = options.locale;
      if (options.workflowId) verifyParams.workflowId = options.workflowId;
      if (options.pinExpiry) verifyParams.pinExpiry = options.pinExpiry;
      
      // Request verification using the start method
      const response = await verify.start(verifyParams);
      console.log('Verification requested successfully:', JSON.stringify(response, null, 2));
      
      // Format the response
      return {
        requestId: response.requestId,
        status: '0', // Success status for compatibility
        errorText: null,
        network: null,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error requesting verification:', error);
      return {
        requestId: null,
        status: error.status || '1', // Error status
        errorText: error.message || 'Unknown error',
        network: null,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Check a verification code provided by the user
   * 
   * @param requestId - The request ID from the verification request
   * @param code - The verification code entered by the user
   * @returns Promise with verification check result
   */
  async checkVerification(requestId: string, code: string) {
    try {
      console.log(`Checking verification code for request: ${requestId}`);
      
      // Get the Verify client
      const verify = await getVerifyClient();
      
      // Check the verification code
      const response = await verify.check({
        request_id: requestId,
        code: code
      });
      console.log('Verification check result:', JSON.stringify(response, null, 2));
      
      // Format the response
      return {
        requestId: requestId,
        status: response.status || '0',
        errorText: response.error_text || null,
        price: response.price || null,
        currency: response.currency || null,
        timestamp: new Date().toISOString(),
        success: response.status === '0'
      };
    } catch (error: any) {
      console.error('Error checking verification code:', error);
      return {
        requestId: requestId,
        status: error.status || '1', // Error status
        errorText: error.message || 'Invalid code',
        price: null,
        currency: null,
        timestamp: new Date().toISOString(),
        success: false
      };
    }
  }
  
  /**
   * Cancel an ongoing verification request
   * 
   * @param requestId - The request ID from the verification request
   * @returns Promise with cancellation result
   */
  async cancelVerification(requestId: string) {
    try {
      console.log(`Cancelling verification request: ${requestId}`);
      
      // Get the Verify client
      const verify = await getVerifyClient();
      
      // Cancel the verification
      const response = await verify.cancel({
        request_id: requestId
      });
      console.log('Verification cancellation result:', JSON.stringify(response, null, 2));
      
      // Format the response
      return {
        requestId: requestId,
        status: response.status || '0',
        errorText: response.error_text || null,
        timestamp: new Date().toISOString(),
        success: response.status === '0'
      };
    } catch (error: any) {
      console.error('Error cancelling verification:', error);
      return {
        requestId: requestId,
        status: error.status || '1', // Error status
        errorText: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
        success: false
      };
    }
  }
}
