# Bedrock Vonage Toolkit

A toolkit for integrating Vonage Number Insight API with AWS Bedrock AI agents.

## Features

- Phone number validation and verification
- Carrier information lookup
- Number portability detection
- Roaming status detection
- Risk assessment
- Caller identity information

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
VONAGE_API_KEY=your_api_key
VONAGE_API_SECRET=your_api_secret
TEST_PHONE_NUMBER=+12025550142  # Optional: For testing
```

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
```

### Deployment

```bash
npm run deploy
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
