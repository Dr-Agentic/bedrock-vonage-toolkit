import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { VerifyService } from '../services/verifyService';
import Joi from 'joi';

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
    
    // Get client IP from event if available
    const sourceIp = event.requestContext?.identity?.sourceIp || null;
    
    // Validate with Joi
    const schema = Joi.object({
      number: Joi.string().required().pattern(/^\+[1-9]\d{1,14}$/)
        .message('Phone number must be in E.164 format (e.g., +12025550123)'),
      brand: Joi.string().required()
        .message('Brand name is required'),
      codeLength: Joi.number().integer().min(4).max(10),
      locale: Joi.string(),
      workflowId: Joi.number().integer(),
      pinExpiry: Joi.number().integer(),
      // Silent authentication parameters
      appHash: Joi.string(),
      sdkVersion: Joi.string(),
      deviceModel: Joi.string(),
      osVersion: Joi.string(),
      countryCode: Joi.string().length(2),
      silentAuthTimeoutSecs: Joi.number().integer().min(5).max(30)
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
    
    // Initialize service and request verification
    const verifyService = new VerifyService();
    const options: any = {};
    
    // Standard verification options
    if (value.codeLength) options.codeLength = value.codeLength;
    if (value.locale) options.locale = value.locale;
    if (value.workflowId) options.workflowId = value.workflowId;
    if (value.pinExpiry) options.pinExpiry = value.pinExpiry;
    
    // Silent authentication options
    if (value.appHash) options.appHash = value.appHash;
    if (value.sdkVersion) options.sdkVersion = value.sdkVersion;
    if (value.deviceModel) options.deviceModel = value.deviceModel;
    if (value.osVersion) options.osVersion = value.osVersion;
    if (value.countryCode) options.countryCode = value.countryCode;
    if (sourceIp) options.sourceIp = sourceIp;
    if (value.silentAuthTimeoutSecs) options.silentAuthTimeoutSecs = value.silentAuthTimeoutSecs;
    
    const result = await verifyService.requestVerification(
      value.number,
      value.brand,
      options
    );
    
    // Return success response
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
        phoneNumber: value.number,
        silentAuth: result.silentAuth,
        nextStep: result.nextStep || 'Check the verification code using the /check-verification endpoint with the requestId and code',
        message: result.silentAuth 
          ? 'Silent authentication in progress' 
          : `Verification code sent to ${value.number}`
      })
    };
  } catch (error: any) {
    console.error('Error in requestVerification handler:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: error.message || 'Failed to request verification'
      })
    };
  }
};
