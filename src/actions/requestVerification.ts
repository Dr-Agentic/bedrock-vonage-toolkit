import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { VerifyService } from '../services/verifyService';
import { formatErrorResponse, formatSuccessResponse } from '../utils/responseFormatter';

/**
 * Lambda handler for requesting phone number verification
 * 
 * @param event - API Gateway event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Request verification event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    const body = event.body ? JSON.parse(event.body) : {};
    const { phoneNumber, brand, codeLength, locale, channel } = body;
    
    // Validate required parameters
    if (!phoneNumber) {
      return formatErrorResponse(400, 'Phone number is required');
    }
    
    if (!brand) {
      return formatErrorResponse(400, 'Brand name is required');
    }
    
    // Validate phone number format (E.164)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return formatErrorResponse(400, 'Phone number must be in E.164 format (e.g., +12025550123)');
    }
    
    // Validate channel if provided
    if (channel && !['sms', 'voice', 'whatsapp'].includes(channel)) {
      return formatErrorResponse(400, 'Channel must be one of: sms, voice, whatsapp');
    }
    
    // Initialize service and request verification
    const verifyService = new VerifyService();
    const result = await verifyService.requestVerification(
      phoneNumber,
      brand,
      codeLength || 4,
      locale || 'en-us',
      (channel as 'sms' | 'voice' | 'whatsapp') || 'sms'
    );
    
    // Return success response
    return formatSuccessResponse({
      requestId: result.requestId,
      status: result.status,
      phoneNumber,
      message: `Verification code sent to ${phoneNumber}`,
      nextStep: 'Check the verification code using the /verify-check endpoint with the requestId and code'
    });
  } catch (error) {
    console.error('Error in requestVerification handler:', error);
    return formatErrorResponse(500, 'Failed to request verification', error);
  }
};
