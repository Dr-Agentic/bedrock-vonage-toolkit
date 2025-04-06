# Bedrock Vonage Toolkit

A toolkit for integrating Vonage APIs with AWS Bedrock AI agents.

## Features

- Phone number verification using Vonage Verify API
- SMS messaging using Vonage SMS API
- Phone number insights using Vonage Number Insight API
- Integration with AWS Bedrock AI agents

## Setup

### Prerequisites

- Node.js 18 or later
- AWS account with Bedrock access
- Vonage API account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your Vonage API credentials:

```
VONAGE_API_KEY=your_api_key
VONAGE_API_SECRET=your_api_secret
TEST_PHONE_NUMBER=your_test_phone_number
```

## Usage

### Local Development

Start the serverless offline server:

```bash
npx serverless offline
```

### Testing the Verify API

Use the provided test scripts to test the Verify API:

```bash
# Test direct API calls
node test-verify-modern.js request
node test-verify-modern.js check <requestId> <code>
node test-verify-modern.js cancel <requestId>

# Test through serverless
node test-local-serverless-modern.js request
node test-local-serverless-modern.js check <requestId> <code>
node test-local-serverless-modern.js cancel <requestId>
```

### Deployment

Deploy to AWS:

```bash
npx serverless deploy
```

## API Endpoints

### Verify API

- `POST /request-verification`: Request a verification code
  - Body: `{ "number": "+1234567890", "brand": "YourApp" }`
  
- `POST /check-verification`: Check a verification code
  - Body: `{ "requestId": "abcd1234", "code": "1234" }`
  
- `POST /cancel-verification`: Cancel a verification request
  - Body: `{ "requestId": "abcd1234" }`

### SMS API

- `POST /send-sms`: Send an SMS message
  - Body: `{ "from": "YourApp", "to": "+1234567890", "text": "Hello world" }`

### Number Insight API

- `POST /number-insight`: Get insights about a phone number
  - Body: `{ "number": "+1234567890" }`

## License

MIT
