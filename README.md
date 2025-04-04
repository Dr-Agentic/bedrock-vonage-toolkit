# Bedrock Vonage Toolkit

A toolkit for integrating Vonage Number Insight API with AWS Bedrock AI agents.

## Overview

This toolkit provides a serverless API that allows AWS Bedrock AI agents to access Vonage's Number Insight API for phone number validation, carrier detection, and fraud prevention. The toolkit includes:

1. Lambda functions for handling API requests
2. Integration with Vonage Number Insight API
3. OpenAPI specification for Bedrock AI agent integration
4. Local testing utilities

## Features

- **Phone Number Validation**: Verify if a phone number is valid and reachable
- **Carrier Detection**: Identify the carrier/network operator of a phone number
- **Porting Status**: Check if a phone number has been ported between carriers
- **Roaming Detection**: Determine if a phone number is currently roaming
- **Risk Assessment**: Get risk scores and recommendations for phone numbers

## Prerequisites

- Node.js 18+
- AWS CLI configured with appropriate permissions
- Vonage API account with API key and secret

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your Vonage API credentials:
   ```
   VONAGE_API_KEY=your_api_key
   VONAGE_API_SECRET=your_api_secret
   ```

## Local Testing

To test the Vonage Number Insight functionality locally:

1. Set a test phone number in your `.env` file:
   ```
   TEST_PHONE_NUMBER=+1234567890
   ```
2. Run the local test script:
   ```
   npx ts-node src/local-test.ts
   ```

## Deployment

To deploy the toolkit to AWS:

```
npm run deploy
```

This will deploy the Lambda functions and API Gateway endpoints using the Serverless Framework.

## Integration with Bedrock AI Agents

To integrate this toolkit with a Bedrock AI agent:

1. Use the OpenAPI specification in `openapi/number-insight.yaml` to create an action group in your Bedrock agent
2. Configure the API endpoint to point to your deployed API Gateway endpoint
3. Test the integration using the Bedrock agent console

## API Reference

### Phone Number Insight

**Endpoint**: `POST /number-insight`

**Request Body**:
```json
{
  "phoneNumber": "+1234567890"
}
```

**Response**:
```json
{
  "phoneNumber": "+1234567890",
  "countryName": "United States",
  "carrier": "Verizon",
  "isValid": true,
  "isReachable": true,
  "isPorted": false,
  "isRoaming": false,
  "roamingCountry": "US",
  "networkType": "mobile",
  "originalCarrier": "Verizon"
}
```

## License

MIT

## Credits

- Vonage Number Insight API
- AWS Bedrock AI
- AWS Lambda
