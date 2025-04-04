/**
 * Formats responses for Bedrock AI Agent actions
 */

interface ResponseOptions {
  statusCode: number;
  body: any;
  headers?: Record<string, string>;
}

/**
 * Format a successful response for Bedrock AI Agent
 * 
 * @param actionGroup - The action group name
 * @param apiPath - The API path that was called
 * @param httpMethod - The HTTP method used
 * @param responseData - The data to return
 * @returns Formatted response for Bedrock AI Agent
 */
export const formatSuccess = (
  actionGroup: string,
  apiPath: string,
  httpMethod: string,
  responseData: any
) => {
  return {
    messageVersion: '1.0',
    response: {
      actionGroup,
      apiPath,
      httpMethod,
      httpStatusCode: 200,
      responseBody: {
        contentType: 'application/json',
        content: JSON.stringify(responseData)
      }
    }
  };
};

/**
 * Format an error response for Bedrock AI Agent
 * 
 * @param actionGroup - The action group name
 * @param apiPath - The API path that was called
 * @param httpMethod - The HTTP method used
 * @param statusCode - HTTP status code
 * @param errorMessage - Error message
 * @returns Formatted error response for Bedrock AI Agent
 */
export const formatError = (
  actionGroup: string,
  apiPath: string,
  httpMethod: string,
  statusCode: number,
  errorMessage: string
) => {
  return {
    messageVersion: '1.0',
    response: {
      actionGroup,
      apiPath,
      httpMethod,
      httpStatusCode: statusCode,
      responseBody: {
        contentType: 'application/json',
        content: JSON.stringify({
          error: errorMessage
        })
      }
    }
  };
};

/**
 * Format a standard HTTP response (for direct API calls)
 * 
 * @param options - Response options
 * @returns Formatted HTTP response
 */
export const formatHttpResponse = (options: ResponseOptions) => {
  return {
    statusCode: options.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      ...options.headers
    },
    body: JSON.stringify(options.body)
  };
};
