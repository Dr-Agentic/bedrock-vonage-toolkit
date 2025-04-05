# AWS Secrets Manager Integration Guide

This guide explains how to use AWS Secrets Manager with the Bedrock Vonage Toolkit for secure credential management.

## Overview

AWS Secrets Manager helps you protect access to your applications, services, and IT resources without the upfront cost and complexity of deploying and maintaining your own secrets management infrastructure. This guide will walk you through setting up and using AWS Secrets Manager with this toolkit.

## Prerequisites

- AWS CLI installed and configured
- Appropriate IAM permissions to create and manage secrets
- Vonage API credentials (API Key and API Secret)

## Setup Instructions

### 1. Create a Secret in AWS Secrets Manager

You can create a secret using either the AWS Management Console or the AWS CLI.

#### Using AWS CLI:

```bash
aws secretsmanager create-secret \
    --name bedrock-vonage-toolkit/credentials \
    --description "Vonage API credentials for Bedrock Vonage Toolkit" \
    --secret-string '{"VONAGE_API_KEY":"your_api_key","VONAGE_API_SECRET":"your_api_secret"}'
```

Replace `your_api_key` and `your_api_secret` with your actual Vonage API credentials.

#### Using AWS Management Console:

1. Open the AWS Secrets Manager console
2. Click "Store a new secret"
3. Select "Other type of secret"
4. Add two key/value pairs:
   - Key: `VONAGE_API_KEY`, Value: your Vonage API key
   - Key: `VONAGE_API_SECRET`, Value: your Vonage API secret
5. Click "Next"
6. Name the secret `bedrock-vonage-toolkit/credentials`
7. Add a description and click "Next"
8. Configure rotation settings if desired (optional)
9. Click "Next" and then "Store"

### 2. Configure IAM Permissions

Ensure your Lambda execution role has permission to access the secret. The serverless.yml file already includes the necessary permissions:

```yaml
iam:
  role:
    statements:
      - Effect: Allow
        Action:
          - secretsmanager:GetSecretValue
        Resource: 
          - arn:aws:secretsmanager:${self:provider.region}:*:secret:bedrock-vonage-toolkit/credentials-*
```

### 3. Deploy Your Application

Deploy your application using the Serverless Framework:

```bash
serverless deploy
```

## How It Works

1. When a Lambda function starts, it checks for the environment variable `VONAGE_CREDENTIALS_SECRET_NAME`
2. The function uses the AWS SDK to retrieve the secret value from AWS Secrets Manager
3. The secret is parsed and the Vonage API credentials are extracted
4. The Vonage client is initialized with these credentials
5. All API calls to Vonage services use these securely stored credentials

## Local Development

For local development, you can use environment variables instead of AWS Secrets Manager:

1. Create a `.env` file in the project root:
   ```
   VONAGE_API_KEY=your_api_key
   VONAGE_API_SECRET=your_api_secret
   ```

2. The application will automatically use these environment variables when running locally

## Rotating Credentials

One of the benefits of using AWS Secrets Manager is the ability to rotate credentials:

1. Update your secret in AWS Secrets Manager with new credentials
2. No code changes or redeployment is needed
3. The next time your functions run, they will automatically use the new credentials

## Troubleshooting

### Common Issues

1. **Access Denied Error**: Ensure your Lambda execution role has the correct permissions to access the secret.

2. **Secret Not Found**: Verify that the secret name matches exactly what's configured in your environment variables.

3. **Invalid Secret Format**: Make sure your secret is stored in the correct JSON format with the keys `VONAGE_API_KEY` and `VONAGE_API_SECRET`.

### Debugging

To debug issues with AWS Secrets Manager integration:

1. Check CloudWatch Logs for detailed error messages
2. Verify the secret exists in the correct region
3. Test access to the secret using the AWS CLI:
   ```bash
   aws secretsmanager get-secret-value --secret-id bedrock-vonage-toolkit/credentials
   ```

## Security Best Practices

1. **Limit Access**: Restrict access to the secret using IAM policies
2. **Enable Encryption**: AWS Secrets Manager encrypts secrets by default
3. **Enable Rotation**: Set up automatic rotation of your Vonage credentials
4. **Use VPC Endpoints**: Consider using VPC endpoints for AWS Secrets Manager to keep traffic within your VPC
5. **Monitor Access**: Enable CloudTrail to monitor access to your secrets

## Additional Resources

- [AWS Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)
- [Vonage API Documentation](https://developer.vonage.com/en/api)
