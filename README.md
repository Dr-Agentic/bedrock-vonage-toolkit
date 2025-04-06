# Bedrock Vonage Toolkit

A serverless toolkit for integrating Vonage (formerly Nexmo) communication services with AWS Bedrock applications.

## Features

- **SMS Messaging**: Send SMS messages to users
- **Phone Verification**: Verify phone numbers using multiple methods
  - Silent Authentication (no user interaction required)
  - SMS Verification Codes
  - Voice Call Verification
- **Serverless Architecture**: Deploy as AWS Lambda functions
- **Direct HTTP Fallback**: Alternative implementation for SDK issues

## Phone Verification Workflows

This toolkit supports multiple verification workflows:

### Comprehensive Workflow (Default)

The most comprehensive workflow (workflow_id: 1) includes:

1. **Silent Authentication**: Attempts to verify the user without any interaction
   - Uses mobile network information to verify the user's SIM card
   - No SMS or notification is sent to the user
   - Fastest and most seamless verification method when available

2. **SMS Verification**: If silent authentication fails or times out
   - Sends a verification code via SMS
   - User must enter the code to complete verification

3. **Voice Call**: If SMS verification times out
   - Places an automated voice call to the user
   - Speaks the verification code

### SMS + Voice Workflow

A simpler workflow (workflow_id: 6) includes:

1. **SMS Verification**: Sends a verification code via SMS
2. **Voice Call**: If SMS verification times out, places an automated call

## Silent Authentication Requirements

To use silent authentication:

- Mobile device must have an active cellular connection
- App must implement the Vonage Verify SDK
- Additional parameters must be provided:
  - `app_hash`: Application hash for Android devices
  - `sdk_version`: Version of the Verify SDK
  - `device_model`: User's device model
  - `os_version`: Operating system version
  - `country_code`: Two-letter country code
  - `source_ip`: User's IP address
  - `silent_auth_timeout_secs`: Timeout for silent auth (5-30 seconds)

## Usage

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file with your Vonage API credentials and test phone number:

```
VONAGE_API_KEY=your_api_key
VONAGE_API_SECRET=your_api_secret
TEST_PHONE_NUMBER=+1234567890
```

You can use the provided `.env.example` file as a template.

### Testing

#### Test Silent Authentication Workflow

```bash
node test-verify-silent-auth.js request
```

#### Test Direct HTTP Implementation

```bash
node test-direct-silent-auth.js
```

#### Test Standard Verification

```bash
node test-verify-specific.js request
node test-verify-specific.js check <requestId> <code>
```

### Deployment

Deploy to AWS using the Serverless Framework:

```bash
npm run deploy
```

## API Reference

### Request Verification

```
POST /request-verification

{
  "number": "+12025550123",
  "brand": "YourAppName",
  "workflowId": 1,
  "appHash": "abcdefghijklmnopqrstuvwxyz123456",
  "sdkVersion": "2.3.0",
  "deviceModel": "iPhone 13",
  "osVersion": "iOS 16.5",
  "countryCode": "US",
  "silentAuthTimeoutSecs": 10
}
```

### Check Verification

```
POST /check-verification

{
  "requestId": "abcd1234efgh5678",
  "code": "1234"
}
```

### Cancel Verification

```
POST /cancel-verification

{
  "requestId": "abcd1234efgh5678"
}
```

## License

MIT
