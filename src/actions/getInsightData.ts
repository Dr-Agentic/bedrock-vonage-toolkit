import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { VonageService } from '../services/vonageService';
import { formatSuccess, formatError } from '../utils/responseFormatter';
import Joi from 'joi';

/**
 * Handler for getting comprehensive phone number insights
 * This function provides detailed information about a phone number including:
 * - Basic number information (country, format)
 * - Carrier details
 * - SIM swap detection
 * - Roaming status
 * - Porting information
 * - Device information
 * - Risk assessment
 */
export const handler = async (event: any, context: Context): Promise<any> => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  try {
    // Determine if this is a direct API call or a Bedrock agent call
    const isBedrockAgent = event.requestBody !== undefined;
    
    // Parse input parameters based on the source
    let phoneNumber: string;
    
    if (isBedrockAgent) {
      // Extract parameters from Bedrock agent request
      const { actionGroup, apiPath } = event;
      const parameters = event.requestBody.inputText ? JSON.parse(event.requestBody.inputText) : {};
      
      // Validate required parameters
      if (!parameters.phoneNumber) {
        return formatError(
          actionGroup,
          apiPath,
          'POST',
          400,
          "Missing required parameter: phoneNumber"
        );
      }
      
      phoneNumber = parameters.phoneNumber;
    } else {
      // Extract parameters from direct API call
      const body = JSON.parse(event.body || '{}');
      
      // Validate with Joi
      const schema = Joi.object({
        phoneNumber: Joi.string().required().pattern(/^\+[1-9]\d{1,14}$/)
          .message('Phone number must be in E.164 format (e.g., +12025550123)')
      });
      
      const { error, value } = schema.validate(body);
      if (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: error.message })
        };
      }
      
      phoneNumber = value.phoneNumber;
    }
    
    // Initialize Vonage service
    const vonageService = new VonageService();
    
    // Get comprehensive number insights
    const insightData = await vonageService.getAdvancedNumberInsight(phoneNumber);
    
    // Format response based on the source of the request
    if (isBedrockAgent) {
      return formatSuccess(
        event.actionGroup,
        event.apiPath,
        'POST',
        {
          phoneNumber: insightData.phoneNumber,
          countryName: insightData.basicInfo.countryName,
          carrier: insightData.carrierInfo.name,
          isValid: insightData.validity.valid,
          isReachable: insightData.validity.reachable,
          simSwapped: insightData.simSwapInfo.swapped,
          daysSinceSimSwap: insightData.simSwapInfo.daysSinceSwap,
          isRoaming: insightData.validity.roaming,
          roamingCountry: insightData.advancedDetails.roamingInfo.countryCode,
          isPorted: insightData.validity.ported,
          riskScore: insightData.riskScore.score,
          riskRecommendation: insightData.riskScore.recommendation,
          deviceInfo: `${insightData.advancedDetails.deviceInfo.deviceBrand} ${insightData.advancedDetails.deviceInfo.deviceModel}`,
          callerName: insightData.advancedDetails.callerIdentity.callerName,
          callerType: insightData.advancedDetails.callerIdentity.callerType
        }
      );
    } else {
      // Return full data for direct API calls
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(insightData)
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
