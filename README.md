# Bedrock Vonage Toolkit

A toolkit for integrating Vonage APIs with AWS Bedrock AI agents.

## Features

- Phone number validation and insights using Vonage Number Insight API
- Phone number verification using Vonage Verify API
- Carrier detection for fraud prevention
- Risk assessment for phone numbers
- Easy integration with AWS Bedrock AI agents

## Installation

```bash
npm install
```

## Configuration

### Using AWS Secrets Manager (Recommended for Production)

1. Create a secret in AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
    --name bedrock-vonage-toolkit/credentials \
    --description "Vonage API credentials for Bedrock Vonage Toolkit" \
    --secret-string '{"VONAGE_API_KEY":"your_api_key","VONAGE_API_SECRET":"your_api_secret"}'
```

2. Make sure your AWS role has permission to access this secret.

### Using Environment Variables (Development Only)

Create a `.env` file with your Vonage API credentials:

```
VONAGE_API_KEY=your_api_key
VONAGE_API_SECRET=your_api_secret
```

## Deployment

```bash
npm run deploy
```

## Usage

The toolkit provides a serverless API that can be called from AWS Bedrock AI agents.

### Number Insight API

```json
POST /number-insight
{
  "phoneNumber": "+12025550123"
}
```

Response:

```json
{
  "phoneNumber": "+12025550123",
  "basicInfo": {
    "internationalFormat": "+12025550123",
    "nationalFormat": "(202) 555-0123",
    "countryCode": "US",
    "countryName": "United States",
    "countryPrefix": "1"
  },
  "carrierInfo": {
    "name": "Verizon",
    "country": "US",
    "networkType": "mobile",
    "networkCode": "310004"
  },
  "validity": {
    "valid": true,
    "reachable": true,
    "ported": false,
    "roaming": false
  },
  "advancedDetails": {
    "roamingInfo": {
      "status": "not_roaming",
      "countryCode": "US",
      "networkName": "Verizon",
      "networkCode": "310004"
    },
    "portingInfo": {
      "status": "not_ported",
      "originalNetwork": "Verizon"
    },
    "callerIdentity": {
      "callerName": "John Doe",
      "callerType": "consumer",
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "riskScore": {
    "score": 10,
    "recommendation": "allow"
  },
  "timestamp": "2023-04-03T21:00:00.000Z"
}
```

### Verify API

#### Request Verification

```json
POST /verify-request
{
  "phoneNumber": "+12025550123",
  "brand": "MyApp",
  "channel": "sms"
}
```

Response:

```json
{
  "requestId": "abcdef0123456789abcdef0123456789",
  "status": {
    "code": "0",
    "message": "Success"
  },
  "phoneNumber": "+12025550123",
  "message": "Verification code sent to +12025550123",
  "nextStep": "Check the verification code using the /verify-check endpoint with the requestId and code"
}
```

#### Check Verification Code

```json
POST /verify-check
{
  "requestId": "abcdef0123456789abcdef0123456789",
  "code": "1234"
}
```

Response:

```json
{
  "requestId": "abcdef0123456789abcdef0123456789",
  "status": {
    "code": "0",
    "message": "Success"
  },
  "verified": true,
  "message": "Phone number successfully verified"
}
```

#### Cancel Verification

```json
POST /verify-cancel
{
  "requestId": "abcdef0123456789abcdef0123456789"
}
```

Response:

```json
{
  "requestId": "abcdef0123456789abcdef0123456789",
  "status": {
    "code": "0",
    "message": "Success"
  },
  "cancelled": true,
  "message": "Verification request successfully cancelled"
}
```

## Integration with AWS Bedrock Agents

This toolkit is designed to be easily integrated with AWS Bedrock Agents. You can use the API endpoints as action groups in your Bedrock Agent to:

1. Validate phone numbers and get insights
2. Send verification codes to users
3. Verify codes entered by users

For more information on integrating with Bedrock Agents, see the [examples](./examples) directory.

## License

MIT
