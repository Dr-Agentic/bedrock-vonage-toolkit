import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { VonageService } from '../services/vonageService';

/**
 * Handler for getting comprehensive phone number insights
 * This function provides detailed information about a phone number including:
 * - Basic number information (country, format)
 * - Carrier details (current and original)
 * - Validity and reachability
 */
export const handler = async (event: any, context: Context): Promise<any> => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  try {
    // For Bedrock Agent requests
    if (event.messageVersion === '1.0') {
      console.log('Processing Bedrock Agent request');
      
      // Extract phone number from request
      let phoneNumber;
      try {
        const requestBody = event.requestBody || {};
        
        // Handle Bedrock Agent format with properties array
        if (requestBody.content && 
            requestBody.content['application/json'] && 
            requestBody.content['application/json'].properties) {
          
          // Extract from properties array
          const properties = requestBody.content['application/json'].properties;
          const phoneNumberProperty = properties.find((prop: any) => prop.name === 'phoneNumber');
          
          if (phoneNumberProperty) {
            phoneNumber = phoneNumberProperty.value;
          }
        } 
        // Handle direct JSON content format (fallback)
        else if (requestBody.content) {
          const content = requestBody.content;
          const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
          phoneNumber = parsedContent.phoneNumber;
        }
        
        console.log('Extracted phone number:', phoneNumber);
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        return {
          messageVersion: '1.0',
          response: {
            actionGroup: event.actionGroup,
            apiPath: event.apiPath,
            httpMethod: event.httpMethod || 'POST',
            httpStatusCode: 400,
            responseBody: {
              contentType: 'application/json',
              content: JSON.stringify({ error: 'Invalid request format' })
            }
          }
        };
      }
      
      if (!phoneNumber) {
        console.error('Missing phone number in request');
        return {
          messageVersion: '1.0',
          response: {
            actionGroup: event.actionGroup,
            apiPath: event.apiPath,
            httpMethod: event.httpMethod || 'POST',
            httpStatusCode: 400,
            responseBody: {
              contentType: 'application/json',
              content: JSON.stringify({ error: 'Phone number is required' })
            }
          }
        };
      }
      
      // Process the phone number
      const vonageService = new VonageService();
      const insightData = await vonageService.getAdvancedNumberInsight(phoneNumber);
      
      // Format response for Bedrock
      const responseData = {
        phoneNumber: insightData.phoneNumber,
        countryName: insightData.basicInfo.countryName,
        currentCarrier: {
          name: insightData.carrierInfo.name,
          networkType: insightData.carrierInfo.networkType
        },
        isValid: insightData.validity.valid,
        riskScore: insightData.riskScore ? insightData.riskScore.score : 0,
        recommendation: insightData.riskScore ? insightData.riskScore.recommendation : 'unknown',
        // Add a simple text summary for the agent to use
        summary: `This is a ${insightData.validity.valid ? 'valid' : 'invalid'} phone number from ${insightData.basicInfo.countryName}. It's associated with ${insightData.carrierInfo.name} and is a ${insightData.carrierInfo.networkType} number. The risk assessment shows a ${insightData.riskScore && insightData.riskScore.score > 50 ? 'high' : 'low'} risk score.`
      };
      
      console.log('Sending response to Bedrock:', JSON.stringify(responseData, null, 2));
      
      // Return formatted response for Bedrock - ensure it matches exactly what Bedrock expects
      return {
        messageVersion: '1.0',
        response: {
          actionGroup: event.actionGroup,
          apiPath: event.apiPath,
          httpMethod: event.httpMethod || 'POST',
          httpStatusCode: 200,
          responseBody: {
            application_json: responseData
          }
        }
      };
    } 
    // For direct API Gateway requests or older Bedrock format
    else {
      // Determine if this is a direct API call or an older Bedrock agent call
      const isBedrockAgent = event.requestBody !== undefined;
      
      // Parse input parameters based on the source
      let phoneNumber: string;
      
      if (isBedrockAgent) {
        // Extract parameters from Bedrock agent request
        const { actionGroup, apiPath } = event;
        
        console.log('Bedrock agent request body (old format):', JSON.stringify(event.requestBody, null, 2));
        
        // Parse the input text as JSON
        let parameters;
        try {
          parameters = event.requestBody && event.requestBody.inputText ? 
            JSON.parse(event.requestBody.inputText) : {};
        } catch (parseError) {
          console.error('Error parsing input JSON:', parseError);
          parameters = {};
        }
        
        console.log('Parsed parameters:', JSON.stringify(parameters, null, 2));
        
        // Validate required parameters
        if (!parameters.phoneNumber) {
          console.error('Missing required parameter: phoneNumber');
          return {
            messageVersion: '1.0',
            response: {
              actionGroup,
              apiPath,
              httpMethod: 'POST',
              httpStatusCode: 400,
              responseBody: {
                contentType: 'application/json',
                content: JSON.stringify({ error: "Missing required parameter: phoneNumber" })
              }
            }
          };
        }
        
        phoneNumber = parameters.phoneNumber;
      } else {
        // Extract parameters from direct API call
        let body;
        try {
          body = JSON.parse(event.body || '{}');
        } catch (parseError) {
          console.error('Error parsing request body:', parseError);
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Invalid JSON in request body' })
          };
        }
        
        // Validate phone number
        if (!body.phoneNumber) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Phone number is required' })
          };
        }
        
        phoneNumber = body.phoneNumber;
      }
      
      console.log(`Processing phone number: ${phoneNumber}`);
      
      // Initialize Vonage service
      const vonageService = new VonageService();
      
      // Get comprehensive number insights
      const insightData = await vonageService.getAdvancedNumberInsight(phoneNumber);
      
      console.log('Insight data retrieved:', JSON.stringify(insightData, null, 2));
      
      // Format response based on the source of the request
      if (isBedrockAgent) {
        const response = {
          phoneNumber: insightData.phoneNumber,
          countryName: insightData.basicInfo.countryName,
          currentCarrier: {
            name: insightData.carrierInfo.name,
            country: insightData.carrierInfo.country,
            networkType: insightData.carrierInfo.networkType
          },
          isValid: insightData.validity.valid,
          isReachable: insightData.validity.reachable,
          isPorted: insightData.validity.ported,
          isRoaming: insightData.validity.roaming
        };
        
        console.log('Formatted response for Bedrock (old format):', JSON.stringify(response, null, 2));
        
        return {
          messageVersion: '1.0',
          response: {
            actionGroup: event.actionGroup,
            apiPath: event.apiPath,
            httpMethod: 'POST',
            httpStatusCode: 200,
            responseBody: {
              contentType: 'application/json',
              content: JSON.stringify(response)
            }
          }
        };
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
    }
  } catch (error: any) {
    console.error('Unhandled error:', error);
    
    // For Bedrock Agent requests (new format)
    if (event.messageVersion === '1.0') {
      return {
        messageVersion: '1.0',
        response: {
          actionGroup: event.actionGroup,
          apiPath: event.apiPath,
          httpMethod: event.httpMethod || 'POST',
          httpStatusCode: 500,
          responseBody: {
            contentType: 'application/json',
            content: JSON.stringify({ 
              error: 'Internal server error', 
              details: error.message 
            })
          }
        }
      };
    } 
    // For Bedrock Agent requests (old format)
    else if (event.requestBody !== undefined) {
      return {
        messageVersion: '1.0',
        response: {
          actionGroup: event.actionGroup,
          apiPath: event.apiPath,
          httpMethod: 'POST',
          httpStatusCode: 500,
          responseBody: {
            contentType: 'application/json',
            content: JSON.stringify({ 
              error: 'Internal server error', 
              details: error.message 
            })
          }
        }
      };
    } 
    // Regular API Gateway error response
    else {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Internal server error',
          details: error.message
        })
      };
    }
  }
};
