# Bedrock Vonage Toolkit

This toolkit provides integration between AWS Bedrock and Vonage APIs for phone number verification, SMS messaging, and number insights.

## Table of Contents
- [Setup](#setup)
- [Number Insight API](#number-insight-api)
- [Verify API](#verify-api)
- [SMS API](#sms-api)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with your Vonage credentials:
   ```
   VONAGE_API_KEY=your_api_key
   VONAGE_API_SECRET=your_api_secret
   ```

3. For AWS deployment, set the following environment variable:
   ```
   VONAGE_CREDENTIALS_SECRET_NAME=your-secret-name
   ```

## Number Insight API

The Number Insight API provides information about phone numbers.

### Features
- Validate phone numbers
- Get carrier information
- Check if a number is mobile, landline, or VoIP

### Usage

```javascript
const { getVonageClient } = require('./src/config/vonage');

// Get advanced insights for a phone number
async function getNumberInsights(phoneNumber) {
  return new Promise((resolve, reject) => {
    const vonage = await getVonageClient();
    vonage.numberInsights.advancedLookup(phoneNumber, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

// Example usage
const insights = await getNumberInsights('+1234567890');
console.log(insights);
```

### Testing

```bash
node test-number-insight.js +1234567890
```

## Verify API

The Verify API allows you to verify that a user has access to a specific phone number through SMS or voice verification.

### Features
- Send verification codes via SMS
- Check verification codes
- Cancel verification requests

### Usage

```javascript
const { VerifyService } = require('./src/services/verifyService');
const verifyService = new VerifyService();

// Request verification
const request = await verifyService.requestVerification(
  '+1234567890',
  'YourBrandName'
);

// Check verification code
const check = await verifyService.checkVerification(
  request.requestId,
  '1234'  // code received by user
);

// Cancel verification
const cancel = await verifyService.cancelVerification(request.requestId);
```

### Testing

```bash
# Request a verification code
node test-verify-direct.js request

# Check a verification code
node test-verify-direct.js check <requestId> <code>

# Cancel a verification request
node test-verify-direct.js cancel <requestId>
```

### Important Notes

- The Vonage Verify API has rate limits and restrictions on concurrent verifications to the same number
- The toolkit uses Vonage SDK v2.11.2 which has specific parameter requirements
- The `channel` parameter is not supported in this version of the SDK

## SMS API

The SMS API allows you to send text messages to users.

### Features
- Send SMS messages
- Receive delivery receipts
- Support for Unicode characters

### Usage

```javascript
const { getVonageClient } = require('./src/config/vonage');

// Send an SMS
async function sendSms(to, text, from) {
  return new Promise((resolve, reject) => {
    const vonage = await getVonageClient();
    vonage.message.sendSms(from, to, text, {}, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

// Example usage
const result = await sendSms(
  '+1234567890',
  'Your message here',
  'YourBrandName'
);
console.log(result);
```

### Testing

```bash
node test-sms.js +1234567890 "Your test message"
```

## Troubleshooting

### Common Issues

#### API Credentials
- Ensure your Vonage API key and secret are correct
- Check that credentials are properly loaded from environment variables or AWS Secrets Manager

#### Rate Limits
- Vonage APIs have rate limits that may affect your usage
- For Verify API: Avoid sending multiple verification requests to the same number in quick succession

#### SDK Version Compatibility
- This toolkit uses Vonage SDK v2.11.2
- Some parameters may not be supported in this version (e.g., 'channel' in Verify API)

### Debugging

Enable debug logging by setting:
```
DEBUG=vonage:* npm start
```

For AWS Lambda deployments, check CloudWatch logs for detailed error information.

## AWS Integration

This toolkit is designed to work seamlessly with AWS services:

### Secrets Management
- API credentials are stored in AWS Secrets Manager
- Access is managed through IAM roles

### Lambda Integration
- The toolkit can be deployed as Lambda functions
- API Gateway can be used to expose endpoints

### Bedrock Integration
- The toolkit can be used with AWS Bedrock for AI-powered communications
- Example use cases include AI-generated SMS messages and verification workflows

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
