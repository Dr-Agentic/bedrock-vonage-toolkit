/**
 * Utility functions for formatting responses for Bedrock AI agents
 */

/**
 * Format a successful response for Bedrock AI agents
 * 
 * @param actionGroup - The action group name
 * @param apiPath - The API path
 * @param httpMethod - The HTTP method
 * @param responseBody - The response body
 * @returns Formatted response for Bedrock AI agent
 */
export function formatSuccess(
  actionGroup: string,
  apiPath: string,
  httpMethod: string,
  responseBody: any
) {
  return {
    messageVersion: '1.0',
    response: {
      actionGroup,
      apiPath,
      httpMethod,
      httpStatusCode: 200,
      responseBody: {
        application_json: JSON.stringify(responseBody)
      }
    }
  };
}

/**
 * Format an error response for Bedrock AI agents
 * 
 * @param actionGroup - The action group name
 * @param apiPath - The API path
 * @param httpMethod - The HTTP method
 * @param statusCode - The HTTP status code
 * @param errorMessage - The error message
 * @returns Formatted error response for Bedrock AI agent
 */
export function formatError(
  actionGroup: string,
  apiPath: string,
  httpMethod: string,
  statusCode: number,
  errorMessage: string
) {
  return {
    messageVersion: '1.0',
    response: {
      actionGroup,
      apiPath,
      httpMethod,
      httpStatusCode: statusCode,
      responseBody: {
        application_json: JSON.stringify({
          error: errorMessage
        })
      }
    }
  };
}
