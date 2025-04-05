import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { SmsService } from '../services/smsService';
import { formatSuccessResponse as formatSuccess, formatErrorResponse as formatError } from '../utils/responseFormatter';
import Joi from 'joi';

/**
 * Handler for sending SMS messages
 * This function sends an SMS message to a specified phone number
 */
export const handler = async (event: any, context: Context): Promise<any> => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  try {
    // Determine if this is a direct API call or a Bedrock agent call
    const isBedrockAgent = event.requestBody !== undefined;
    
    // Parse input parameters based on the source
    let from: string;
    let to: string;
    let text: string;
    let options: any = {};
    
    if (isBedrockAgent) {
      // Extract parameters from Bedrock agent request
      const { actionGroup, apiPath } = event;
      const parameters = event.requestBody.inputText ? JSON.parse(event.requestBody.inputText) : {};
      
      // Validate required parameters
      if (!parameters.from) {
        return formatError(
          actionGroup,
          apiPath,
          'POST',
          400,
          "Missing required parameter: from"
        );
      }
      
      if (!parameters.to) {
        return formatError(
          actionGroup,
          apiPath,
          'POST',
          400,
          "Missing required parameter: to"
        );
      }
      
      if (!parameters.text) {
        return formatError(
          actionGroup,
          apiPath,
          'POST',
          400,
          "Missing required parameter: text"
        );
      }
      
      from = parameters.from;
      to = parameters.to;
      text = parameters.text;
      
      // Optional parameters
      if (parameters.type) options.type = parameters.type;
      if (parameters.ttl) options.ttl = parameters.ttl;
      if (parameters.statusReportReq) options.statusReportReq = parameters.statusReportReq;
      if (parameters.webhookUrl) options.webhookUrl = parameters.webhookUrl;
      if (parameters.webhookMethod) options.webhookMethod = parameters.webhookMethod;
      if (parameters.clientRef) options.clientRef = parameters.clientRef;
      
    } else {
      // Extract parameters from direct API call
      const body = JSON.parse(event.body || '{}');
      
      // Validate with Joi
      const schema = Joi.object({
        from: Joi.string().required()
          .message('Sender ID or phone number is required'),
        to: Joi.string().required().pattern(/^\+[1-9]\d{1,14}$/)
          .message('Recipient phone number must be in E.164 format (e.g., +12025550123)'),
        text: Joi.string().required()
          .message('Message text is required'),
        type: Joi.string().valid('text', 'unicode', 'binary'),
        ttl: Joi.number().integer().min(300000).max(259200000),
        statusReportReq: Joi.boolean(),
        webhookUrl: Joi.string().uri(),
        webhookMethod: Joi.string().valid('GET', 'POST'),
        clientRef: Joi.string().max(40)
      });
      
      const { error, value } = schema.validate(body);
      if (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: error.message })
        };
      }
      
      from = value.from;
      to = value.to;
      text = value.text;
      
      // Optional parameters
      if (value.type) options.type = value.type;
      if (value.ttl) options.ttl = value.ttl;
      if (value.statusReportReq) options.statusReportReq = value.statusReportReq;
      if (value.webhookUrl) options.webhookUrl = value.webhookUrl;
      if (value.webhookMethod) options.webhookMethod = value.webhookMethod;
      if (value.clientRef) options.clientRef = value.clientRef;
    }
    
    // Initialize SMS service
    const smsService = new SmsService();
    
    // Send SMS
    const smsResult = await smsService.sendSms(from, to, text, options);
    
    // Format response based on the source of the request
    if (isBedrockAgent) {
      return formatSuccess(
        event.actionGroup,
        event.apiPath,
        'POST',
        {
          messageId: smsResult.messageId,
          to: smsResult.to,
          status: smsResult.status.message,
          deliveryStatus: smsResult.deliveryStatus,
          messageCount: smsResult.messageCount,
          errorMessage: smsResult.errorMessage || null,
          timestamp: smsResult.timestamp
        }
      );
    } else {
      // Return full data for direct API calls
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(smsResult)
      };
    }
  } catch (error: any) {
    console.error('Error processing request:', error);
    
    // Format error response based on the source of the request
    if (event.requestBody !== undefined) {
      return formatError(
        event.actionGroup,
        event.apiPath,
        'POST',
        500,
        error.message || "Internal server error"
      );
    } else {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: error.message || "Internal server error"
        })
      };
    }
  }
};
