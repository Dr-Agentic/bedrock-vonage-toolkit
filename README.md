# Bedrock Vonage Toolkit

A comprehensive toolkit for building AWS Bedrock AI Agent actions that leverage Vonage APIs for communication capabilities.

## Overview

This toolkit provides ready-to-deploy Lambda functions that can be used as custom actions for Amazon Bedrock AI Agents. It integrates with Vonage APIs to enable AI agents to:

- Analyze phone numbers for fraud detection and verification
- Send SMS messages
- Make voice calls
- Verify phone numbers via SMS or voice
- And more...

## Features

### Number Insight

The Number Insight API provides comprehensive information about phone numbers, including:

- **Fraud Detection**: Identify potential fraud risks with SIM swap detection
- **Number Validation**: Verify if a phone number is valid and reachable
- **Carrier Information**: Get details about the carrier/network operator
- **Roaming Status**: Check if a phone is currently roaming and in which country
- **Porting Information**: Determine if a number has been recently ported
- **Device Information**: Get details about the device associated with the number
- **Risk Assessment**: Receive a risk score and recommendation

## Getting Started

### Prerequisites

- AWS Account with access to Lambda and Bedrock
- Vonage API account and credentials
- Node.js 18+
- Serverless Framework (for deployment)

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/bedrock-vonage-toolkit.git
   cd bedrock-vonage-toolkit
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure your environment variables:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file with your Vonage API credentials.

### Deployment

Deploy to AWS using the Serverless Framework:

```
npm run deploy
```

## Using with Amazon Bedrock AI Agents

### Setting Up a Custom Action Group

1. In the Amazon Bedrock console, create a new agent or edit an existing one
2. Add a new Action Group
3. Select "OpenAPI schema" as the definition method
4. Upload or paste the OpenAPI schema from the `openapi` directory
5. Configure the API URL to point to your deployed Lambda function
6. Save and build your agent

### Example Agent Prompts

Here are some example prompts that your Bedrock AI Agent can now handle:

- "Check if this phone number +1234567890 is valid"
- "Is +1234567890 a mobile or landline?"
- "Has the SIM card for +1234567890 been swapped recently?"
- "What carrier is +1234567890 using?"
- "Is +1234567890 currently roaming?"
- "What's the risk level for +1234567890?"

## Development

### Project Structure

```
bedrock-vonage-toolkit/
├── src/
│   ├── actions/         # Lambda function handlers
│   ├── config/          # Configuration files
│   ├── models/          # TypeScript interfaces
│   ├── services/        # Service layer for API interactions
│   └── utils/           # Utility functions
├── openapi/             # OpenAPI schemas for Bedrock AI Agent integration
├── tests/               # Test files
├── serverless.yml       # Serverless Framework configuration
└── package.json
```

### Adding New Actions

1. Create a new service method in `src/services/vonageService.ts`
2. Create a new Lambda handler in `src/actions/`
3. Add the function to `serverless.yml`
4. Create or update the OpenAPI schema in `openapi/`

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
