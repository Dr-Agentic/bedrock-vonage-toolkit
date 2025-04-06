# Bedrock Vonage Toolkit

A toolkit for integrating Vonage Number Insight API with AWS Bedrock AI agents.

## Features

- Phone number validation and verification
- Carrier information lookup
- Number portability detection
- Roaming status detection
- Risk assessment
- Caller identity information
- SMS messaging
- Two-factor authentication

## Installation

```bash
npm install
```

## Configuration

### Local Development

Create a `.env` file in the root directory with the following variables:

```
# Only needed for local development and testing
VONAGE_API_KEY=your_api_key
VONAGE_API_SECRET=your_api_secret

# Test parameters
TEST_PHONE_NUMBER=+12025550142  # Optional: For testing
```

### AWS Deployment

When deployed to AWS, the application uses AWS Secrets Manager to store sensitive credentials:

1. Create a secret in AWS Secrets Manager with the following structure:
   ```json
   {
     "apiKey": "your_vonage_api_key",
     "apiSecret": "your_vonage_api_secret"
   }
   ```

2. The default secret name is `vonage/api-credentials-{stage}` where `{stage}` is your deployment stage (e.g., `dev`, `prod`).

3. Update the IAM permissions in `serverless.yml` if you use a different secret name.

## Usage

### Local Testing

```bash
npm run start
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/services/vonageService.test.ts

# Run with coverage
npm test -- --coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Deployment

```bash
# Deploy to dev stage
npm run deploy

# Deploy to production stage
npm run deploy -- --stage prod
```

## Project Structure

```
├── src/
│   ├── actions/           # Business logic actions
│   ├── config/            # Configuration files
│   ├── models/            # Data models
│   ├── services/          # External service integrations
│   └── utils/             # Utility functions
├── tests/
│   ├── actions/           # Action tests
│   ├── integration/       # Integration tests
│   ├── services/          # Service tests
│   └── utils/             # Utility tests
├── .env                   # Environment variables (not in repo)
├── jest.config.js         # Jest configuration
├── package.json           # Project dependencies
├── serverless.yml         # Serverless configuration
└── tsconfig.json          # TypeScript configuration
```

## Security

This project uses AWS Secrets Manager to securely store API credentials. In production environments, no sensitive credentials are stored in environment variables or code.

### Secrets Management

- API keys and secrets are stored in AWS Secrets Manager
- Secrets are cached with a TTL to reduce API calls
- Local development can use environment variables as a fallback
- IAM permissions are scoped to specific secrets

## Testing Strategy

The project uses Jest for testing with the following types of tests:

1. **Unit Tests**: Test individual functions and classes in isolation
2. **Integration Tests**: Test interactions between components
3. **End-to-End Tests**: Test complete workflows

### Test Coverage

We aim for at least 70% code coverage across the codebase. Coverage reports are generated after running tests with the `--coverage` flag.

## Contributing

1. Write tests for new features
2. Ensure all tests pass before submitting PRs
3. Follow the existing code style
4. Update documentation as needed

## License

MIT
