import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { VerifyService } from '../services/verifyService';
import Joi from 'joi';

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
    
    // Validate with Joi
    const schema = Joi.object({
      requestId: Joi.string().required()
        .message('Request ID is required')
    });
    
    const { error, value } = schema.validate(body);
    if (error) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ error: error.message })
      };
    }
    
    // Initialize service and cancel verification
    const verifyService = new VerifyService();
    const result = await verifyService.cancelVerification(value.requestId);
    
    // Return response based on cancellation result
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        requestId: result.requestId,
        status: result.status,
        success: result.success,
        message: result.success 
          ? 'Verification cancelled successfully' 
          : `Failed to cancel verification: ${result.errorText || 'Unknown error'}`
      })
    };
  } catch (error: any) {
    console.error('Error in cancelVerification handler:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: error.message || 'Failed to cancel verification'
      })
    };
  }
};
