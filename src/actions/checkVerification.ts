import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { VerifyService } from '../services/verifyService';
import { formatErrorResponse, formatSuccessResponse } from '../utils/responseFormatter';

/**
 * Lambda handler for checking a verification code
 * 
 * @param event - API Gateway event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Check verification event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    const body = event.body ? JSON.parse(event.body) : {};
    const { requestId, code } = body;
    
    // Validate required parameters
    if (!requestId) {
      return formatErrorResponse(400, 'Request ID is required');
    }
    
    if (!code) {
      return formatErrorResponse(400, 'Verification code is required');
    }
    
    // Initialize service and check verification code
    const verifyService = new VerifyService();
    const result = await verifyService.checkVerification(requestId, code);
    
    // Return appropriate response based on verification result
    if (result.verified) {
      return formatSuccessResponse({
        requestId: result.requestId,
        status: result.status,
        verified: true,
        message: 'Phone number successfully verified'
      });
    } else {
      return formatErrorResponse(400, 'Verification failed', {
        requestId: result.requestId,
        status: result.status,
        verified: false,
        message: result.status.message
      });
    }
  } catch (error) {
    console.error('Error in checkVerification handler:', error);
    return formatErrorResponse(500, 'Failed to check verification code', error);
  }
};
