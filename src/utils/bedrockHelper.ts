/**
 * Helper utilities for AWS Bedrock Agent integration
 */

/**
 * Parses a Bedrock Agent request to extract parameters
 * @param event The Lambda event from Bedrock Agent
 * @returns The extracted parameters
 */
export function parseBedrockRequest(event: any): any {
  try {
    // Check if this is a Bedrock Agent request
    if (!event.requestBody) {
      throw new Error('Not a Bedrock Agent request');
    }
    
    // Extract parameters from the request
    const parameters = event.requestBody.inputText ? 
      JSON.parse(event.requestBody.inputText) : 
      {};
    
    return {
      isBedrockAgent: true,
      actionGroup: event.actionGroup,
      apiPath: event.apiPath,
      parameters
    };
  } catch (error) {
    return {
      isBedrockAgent: false,
      error
    };
  }
}

/**
 * Formats a successful response for Bedrock Agent
 * @param actionGroup The action group name
 * @param apiPath The API path
 * @param method The HTTP method
 * @param responseBody The response body
 * @returns Formatted response for Bedrock Agent
 */
export function formatBedrockSuccess(
  actionGroup: string,
  apiPath: string,
  method: string,
  responseBody: any
): any {
  return {
    messageVersion: '1.0',
    response: {
      actionGroup,
      apiPath,
      httpMethod: method,
      httpStatusCode: 200,
      responseBody: {
        contentType: 'application/json',
        content: JSON.stringify(responseBody)
      }
    }
  };
}

/**
 * Formats an error response for Bedrock Agent
 * @param actionGroup The action group name
 * @param apiPath The API path
 * @param method The HTTP method
 * @param statusCode The HTTP status code
 * @param errorMessage The error message
 * @returns Formatted error response for Bedrock Agent
 */
export function formatBedrockError(
  actionGroup: string,
  apiPath: string,
  method: string,
  statusCode: number,
  errorMessage: string
): any {
  return {
    messageVersion: '1.0',
    response: {
      actionGroup,
      apiPath,
      httpMethod: method,
      httpStatusCode: statusCode,
      responseBody: {
        contentType: 'application/json',
        content: JSON.stringify({ error: errorMessage })
      }
    }
  };
}

/**
 * Determines if a Lambda event is from a Bedrock Agent
 * @param event The Lambda event
 * @returns True if the event is from a Bedrock Agent
 */
export function isBedrockAgentRequest(event: any): boolean {
  return event.requestBody !== undefined && 
         event.actionGroup !== undefined && 
         event.apiPath !== undefined;
}

/**
 * Logs details about a Bedrock Agent request for debugging
 * @param event The Lambda event from Bedrock Agent
 */
export function logBedrockRequest(event: any): void {
  if (isBedrockAgentRequest(event)) {
    console.log('Bedrock Agent Request:', JSON.stringify({
      actionGroup: event.actionGroup,
      apiPath: event.apiPath,
      parameters: event.requestBody.inputText ? 
        JSON.parse(event.requestBody.inputText) : 
        {}
    }, null, 2));
  }
}
