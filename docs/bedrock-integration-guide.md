# AWS Bedrock Agent Integration Guide

This guide explains how to integrate the Bedrock Vonage Toolkit with AWS Bedrock Agents to enable phone number verification and insights capabilities in your AI agents.

## Overview

AWS Bedrock Agents can be enhanced with custom actions that allow them to perform specific tasks. This toolkit provides ready-to-use API endpoints that can be integrated as action groups in your Bedrock Agent to:

1. Validate phone numbers and get detailed insights
2. Send verification codes to users via SMS, voice call, or WhatsApp
3. Verify codes entered by users to confirm phone number ownership

## Prerequisites

- An AWS account with access to AWS Bedrock
- The Bedrock Vonage Toolkit deployed to your AWS account
- Basic understanding of AWS Bedrock Agents and OpenAPI specifications

## Integration Steps

### Step 1: Deploy the Bedrock Vonage Toolkit

Follow the instructions in the main README to deploy the toolkit to your AWS account. Make sure to set up AWS Secrets Manager for secure credential management.

### Step 2: Create a Bedrock Agent

1. Open the AWS Bedrock console
2. Navigate to "Agents" and click "Create agent"
3. Configure your agent with a name, description, and foundation model
4. Complete the basic setup

### Step 3: Add Action Groups

#### Number Insight Action Group

1. In your agent configuration, go to "Action groups" and click "Add"
2. Enter a name (e.g., "PhoneNumberInsight") and description
3. For API schema, select "Upload OpenAPI schema" and upload the `/openapi/number-insight.yaml` file from this repository
4. For API URL, enter the base URL of your deployed API (e.g., `https://abc123def.execute-api.us-east-1.amazonaws.com/dev`)
5. Configure authentication if needed
6. Click "Create"

#### Phone Verification Action Group

1. In your agent configuration, go to "Action groups" and click "Add"
2. Enter a name (e.g., "PhoneVerification") and description
3. For API schema, select "Upload OpenAPI schema" and upload the `/openapi/verify-api.yaml` file from this repository
4. For API URL, enter the base URL of your deployed API
5. Configure authentication if needed
6. Click "Create"

### Step 4: Create Agent Prompts

Configure your agent with prompts that help it understand when to use the phone verification capabilities. Here are some example prompts:

#### For Number Insight:

```
When a user asks about validating a phone number or getting information about a phone number, use the PhoneNumberInsight action group to analyze the number. Look for phone numbers in E.164 format (e.g., +12025550123) in the user's input.
```

#### For Phone Verification:

```
When a user wants to verify their phone number:
1. Ask for their phone number if not provided
2. Use the PhoneVerification action group's verify-request endpoint to send a verification code
3. Ask the user to enter the code they received
4. Use the verify-check endpoint to validate the code
5. Inform the user if verification was successful or failed
```

### Step 5: Test Your Agent

1. Build and test your agent in the AWS Bedrock console
2. Try prompts like:
   - "Can you tell me information about this phone number: +12025550123?"
   - "I need to verify my phone number +12025550123"
   - "I received the code 1234, can you verify it?"

## Example Conversations

### Number Insight Example

**User**: "Can you check if this phone number is valid: +12025550123?"

**Agent**: "I'll check that phone number for you. Let me analyze it..."

*[Agent calls the number-insight API]*

**Agent**: "I've analyzed the phone number +12025550123. It's a valid mobile number from the United States. The carrier is Verizon, and there are no signs of fraud risk. The number has not been ported from another carrier and is not currently roaming."

### Verification Example

**User**: "I need to verify my phone number."

**Agent**: "I'd be happy to help you verify your phone number. Please provide your phone number in international format (e.g., +12025550123)."

**User**: "+14155552671"

**Agent**: "Thanks! I'll send a verification code to +14155552671 via SMS. Please wait a moment..."

*[Agent calls the verify-request API]*

**Agent**: "I've sent a verification code to your phone number. Please enter the code when you receive it."

**User**: "The code is 1234"

*[Agent calls the verify-check API]*

**Agent**: "Great! Your phone number has been successfully verified. Is there anything else you'd like help with?"

## Advanced Configuration

### Custom Error Handling

You can enhance your agent's prompts to handle common errors:

```
If the verification fails with status code 13 (Code invalid), ask the user to double-check the code and try again.
If the verification fails with status code 11 (Code expired), offer to send a new verification code.
```

### Multi-step Workflows

For complex verification scenarios, you can create multi-step workflows:

1. First, analyze the phone number using the Number Insight API
2. If the number is valid and low risk, proceed with verification
3. If verification succeeds, update user profile or proceed with sensitive operations

## Security Considerations

1. **Input Validation**: Always validate phone numbers before processing
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Sensitive Data**: Be careful about how verification codes are handled in logs and conversations
4. **Authentication**: Consider adding authentication to your API endpoints

## Troubleshooting

### Common Issues

1. **Invalid Phone Format**: Ensure phone numbers are in E.164 format
2. **API Permissions**: Verify that your Bedrock Agent has permission to call your API
3. **Timeout Issues**: If verification takes too long, adjust your agent's timeout settings

## Additional Resources

- [AWS Bedrock Agents Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html)
- [Vonage API Documentation](https://developer.vonage.com/en/api)
- [OpenAPI Specification](https://swagger.io/specification/)
