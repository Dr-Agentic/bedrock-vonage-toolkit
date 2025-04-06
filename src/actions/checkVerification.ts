import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { VerifyService } from '../services/verifyService';
import Joi from 'joi';

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
    
    // Validate with Joi
    const schema = Joi.object({
      requestId: Joi.string().required()
        .message('Request ID is required'),
      code: Joi.string().required()
        .message('Verification code is required')
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
    
    // Initialize service and check verification
    const verifyService = new VerifyService();
    const result = await verifyService.checkVerification(
      value.requestId,
      value.code
    );
    
    // Return response based on verification result
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
          ? 'Verification successful' 
          : `Verification failed: ${result.errorText || 'Invalid code'}`,
        price: result.price,
        currency: result.currency
      })
    };
  } catch (error: any) {
    console.error('Error in checkVerification handler:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: error.message || 'Failed to check verification'
      })
    };
  }
};
