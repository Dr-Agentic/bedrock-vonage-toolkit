import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * Format a successful API response
 * 
 * @param data - Response data
 * @param statusCode - HTTP status code (default: 200)
 * @returns Formatted API Gateway response
 */
export const formatSuccessResponse = (data: any, statusCode: number = 200): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(data)
  };
};

/**
 * Format an error API response
 * 
 * @param statusCode - HTTP status code
 * @param message - Error message
 * @param details - Additional error details
 * @returns Formatted API Gateway response
 */
export const formatErrorResponse = (
  statusCode: number, 
  message: string, 
  details?: any
): APIGatewayProxyResult => {
  const response: any = {
    error: message
  };
  
  // Add error details if provided
  if (details) {
    if (details instanceof Error) {
      // Handle Error objects
      response.details = {
        name: details.name,
        message: details.message,
        stack: process.env.NODE_ENV === 'dev' ? details.stack : undefined
      };
    } else {
      // Handle other types of details
      response.details = details;
    }
  }
  
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(response)
  };
};
