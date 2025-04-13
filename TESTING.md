# Testing Guide for Bedrock Vonage Toolkit

This document provides information about the various testing methods available for the Bedrock Vonage Toolkit.

## Test Scripts

The project includes several test scripts for testing the Vonage Number Insight functionality from the command line:

### 1. API Endpoint Testing

**File:** `test-direct-api.js`

**Purpose:** Tests the deployed API endpoint via HTTPS. This is the most reliable way to test your deployed API as it makes actual HTTP requests to your API Gateway endpoint.

**Usage:**
```bash
node test-direct-api.js
```

**Configuration:**
- Uses the `TEST_PHONE_NUMBER` from your `.env` file or a default number
- Automatically targets your deployed API endpoint
- Displays the full API response including any error messages

**When to use:**
- After deployment to verify your API is working correctly
- To diagnose issues with the deployed service
- To test with different phone numbers by modifying the script

### 2. Local Service Testing

**File:** `test-local.js`

**Purpose:** Tests the VonageService directly without going through the Lambda handler. This requires TypeScript compilation to work properly.

**Usage:**
```bash
# First compile the TypeScript code
npm run build

# Then run the test
node test-local.js
```

**Configuration:**
- Uses the `TEST_PHONE_NUMBER` from your `.env` file or a default number
- Uses local environment variables for Vonage API credentials
- Bypasses the Lambda handler and API Gateway

**When to use:**
- During development to test changes to the VonageService
- To isolate service-level issues from API Gateway or Lambda issues
- For faster testing cycles during development

## Automated Tests

The project also includes automated tests using Jest:

### Unit Tests

**Command:**
```bash
npm run test:unit
```

Tests individual components in isolation, including:
- Services (VonageService, SecretsManager)
- Utility functions
- Models

### Integration Tests

**Command:**
```bash
npm run test:integration
```

Tests interactions between components, such as:
- Service interactions with external APIs
- Handler functions with services

### All Tests

**Command:**
```bash
npm test
```

Runs all tests and generates a coverage report.

## Troubleshooting Common Issues

### "Invalid credentials" Error

If you see "Invalid credentials" in the API response:

1. Check that your Vonage API credentials are correctly set up in AWS Secrets Manager
2. Verify the secret name matches what's in your `serverless.yml` file
3. For local testing, ensure your `.env` file has the correct credentials

### Connection Issues

If you can't connect to the API:

1. Verify the API endpoint URL in the test script
2. Check that your Lambda function is deployed correctly
3. Verify API Gateway settings and CORS configuration

### TypeScript Compilation Errors

If you encounter TypeScript errors when running `npm run build`:

1. Make sure all dependencies are installed: `npm install`
2. Check for type definition issues in your code
3. Update type definitions if using newer versions of libraries

## Adding New Tests

When adding new tests:

1. Follow the existing patterns for consistency
2. Add appropriate documentation in the test file
3. Update this guide if adding new test scripts or methods
