# AWS Bedrock Agent Integration Guide

This guide explains how to integrate the Bedrock Vonage Toolkit with AWS Bedrock Agents to enable AI-powered communications capabilities.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setting Up Action Groups](#setting-up-action-groups)
  - [Number Insight Action Group](#number-insight-action-group)
  - [Verify API Action Group](#verify-api-action-group)
  - [SMS API Action Group](#sms-api-action-group)
- [Testing Your Agent](#testing-your-agent)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

1. Deployed the Bedrock Vonage Toolkit to AWS (see main README.md)
2. Created an AWS Bedrock Agent
3. Access to the AWS Bedrock console
4. Vonage API credentials stored in AWS Secrets Manager

## Setting Up Action Groups

### Number Insight Action Group

The Number Insight action group allows your Bedrock Agent to validate phone numbers and retrieve carrier information.

#### OpenAPI Schema

```yaml
openapi: 3.0.0
info:
  title: Vonage Number Insight API
  version: 1.0.0
  description: API for validating phone numbers and retrieving carrier information
paths:
  /number-insight:
    post:
      operationId: getNumberInsight
      summary: Get detailed information about a phone number
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - phoneNumber
              properties:
                phoneNumber:
                  type: string
                  description: Phone number in E.164 format (e.g., +12025550123)
      responses:
        '200':
          description: Number insight information
          content:
            application/json:
              schema:
                type: object
                properties:
                  valid:
                    type: boolean
                    description: Whether the phone number is valid
                  reachable:
                    type: boolean
                    description: Whether the phone number is reachable
                  carrier:
                    type: string
                    description: Carrier name
                  countryCode:
                    type: string
                    description: Country code (e.g., US)
                  phoneType:
                    type: string
                    description: Type of phone (mobile, landline, voip)
                  ported:
                    type: boolean
                    description: Whether the number has been ported
```

#### Lambda Function Configuration

1. Navigate to your deployed Lambda function for Number Insight
2. Configure the function to handle the API request format
3. Set up appropriate IAM permissions for Secrets Manager access

#### Example Agent Prompts

- "Validate this phone number: +12025550123"
- "Is +12025550123 a mobile number?"
- "What carrier is +12025550123 using?"
- "Check if +12025550123 is valid"

### Verify API Action Group

The Verify API action group enables your Bedrock Agent to send verification codes and validate them.

#### OpenAPI Schema

```yaml
openapi: 3.0.0
info:
  title: Vonage Verify API
  version: 1.0.0
  description: API for phone number verification
paths:
  /verify/request:
    post:
      operationId: requestVerification
      summary: Request a verification code
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - phoneNumber
                - brand
              properties:
                phoneNumber:
                  type: string
                  description: Phone number in E.164 format (e.g., +12025550123)
                brand:
                  type: string
                  description: Name of your brand or application
                codeLength:
                  type: integer
                  description: Length of the verification code (4-10 digits)
                  default: 4
                locale:
                  type: string
                  description: Locale for the verification message (e.g., en-us)
      responses:
        '200':
          description: Verification request response
          content:
            application/json:
              schema:
                type: object
                properties:
                  requestId:
                    type: string
                    description: ID of the verification request
                  status:
                    type: string
                    description: Status of the request
  /verify/check:
    post:
      operationId: checkVerification
      summary: Check a verification code
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - requestId
                - code
              properties:
                requestId:
                  type: string
                  description: ID of the verification request
                code:
                  type: string
                  description: Verification code received by the user
      responses:
        '200':
          description: Verification check response
          content:
            application/json:
              schema:
                type: object
                properties:
                  valid:
                    type: boolean
                    description: Whether the code is valid
                  status:
                    type: string
                    description: Status of the verification
  /verify/cancel:
    post:
      operationId: cancelVerification
      summary: Cancel a verification request
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - requestId
              properties:
                requestId:
                  type: string
                  description: ID of the verification request to cancel
      responses:
        '200':
          description: Verification cancellation response
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    description: Whether the cancellation was successful
                  status:
                    type: string
                    description: Status of the cancellation
```

#### Example Agent Prompts

- "Send a verification code to +12025550123"
- "Verify code 1234 for request 1a2b3c4d"
- "Cancel the verification request 1a2b3c4d"

### SMS API Action Group

The SMS API action group allows your Bedrock Agent to send text messages.

#### OpenAPI Schema

```yaml
openapi: 3.0.0
info:
  title: Vonage SMS API
  version: 1.0.0
  description: API for sending SMS messages
paths:
  /sms/send:
    post:
      operationId: sendSms
      summary: Send an SMS message
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - to
                - text
              properties:
                from:
                  type: string
                  description: Sender ID or phone number
                  default: "YourApp"
                to:
                  type: string
                  description: Recipient phone number in E.164 format (e.g., +12025550123)
                text:
                  type: string
                  description: Message content
                type:
                  type: string
                  description: Message type (text, unicode, binary)
                  default: "text"
                ttl:
                  type: integer
                  description: Time-to-live in milliseconds
                statusReportReq:
                  type: boolean
                  description: Whether to request a delivery receipt
                  default: false
      responses:
        '200':
          description: SMS sending response
          content:
            application/json:
              schema:
                type: object
                properties:
                  messageId:
                    type: string
                    description: ID of the sent message
                  status:
                    type: object
                    properties:
                      code:
                        type: string
                        description: Status code
                      message:
                        type: string
                        description: Status message
                  to:
                    type: string
                    description: Recipient phone number
                  deliveryStatus:
                    type: string
                    description: Delivery status (sent, delivered, failed)
```

#### Example Agent Prompts

- "Send a text message to +12025550123 saying 'Your appointment is confirmed'"
- "Text +12025550123 to let them know their order has shipped"
- "Send an SMS to John at +12025550123 with the meeting details"

## Testing Your Agent

1. In the AWS Bedrock console, navigate to your agent
2. Open the Test window
3. Try the example prompts for each action group
4. Check the execution details to see the API requests and responses

## Troubleshooting

### Common Issues

#### Illegal Sender Address

If you receive an "Illegal Sender Address - rejected" error:

1. Use a numeric sender ID (e.g., "12345") for testing
2. Purchase a Vonage virtual number for production use
3. Register your alphanumeric sender ID with Vonage (required for some countries)

#### Authentication Failures

If you see authentication errors:

1. Verify your Vonage API credentials in AWS Secrets Manager
2. Check that your Lambda function has permission to access the secret
3. Ensure the secret name matches what's expected in your code

#### Rate Limits

If you encounter rate limit errors:

1. Implement exponential backoff and retry logic
2. Consider purchasing higher throughput from Vonage for production use
3. Cache results where appropriate to reduce API calls
