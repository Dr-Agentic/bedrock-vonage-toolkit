import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { VerifyService } from '../services/verifyService';
import { formatErrorResponse, formatSuccessResponse } from '../utils/responseFormatter';

/**
 * Lambda handler for cancelling a verification request
 * 
 * @param event - API Gateway event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Cancel verification event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    const body = event.body ? JSON.parse(event.body) : {};
    const { requestId } = body;
    
    // Validate required parameters
    if (!requestId) {
      return formatErrorResponse(400, 'Request ID is required');
    }
    
    // Initialize service and cancel verification
    const verifyService = new VerifyService();
    const result = await verifyService.cancelVerification(requestId);
    
    // Return appropriate response based on cancellation result
    if (result.cancelled) {
      return formatSuccessResponse({
        requestId: result.requestId,
        status: result.status,
        cancelled: true,
        message: 'Verification request successfully cancelled'
      });
    } else {
      return formatErrorResponse(400, 'Failed to cancel verification', {
        requestId: result.requestId,
        status: result.status,
        cancelled: false,
        message: result.status.message
      });
    }
  } catch (error) {
    console.error('Error in cancelVerification handler:', error);
    return formatErrorResponse(500, 'Failed to cancel verification', error);
  }
};
