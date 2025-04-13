# Troubleshooting Guide

This guide provides solutions for common issues you might encounter when using the Bedrock Vonage Toolkit.

## Table of Contents

- [SMS Issues](#sms-issues)
- [Verify API Issues](#verify-api-issues)
- [Number Insight Issues](#number-insight-issues)
- [AWS Integration Issues](#aws-integration-issues)
- [SDK Version Issues](#sdk-version-issues)

## SMS Issues

### Illegal Sender Address

**Error Message**: `Illegal Sender Address - rejected` (Status code: 15)

**Causes**:
- Using an alphanumeric sender ID that isn't registered
- Using a sender ID that's not allowed in the destination country
- Using a sender ID format that doesn't comply with local regulations

**Solutions**:

1. **Use a numeric sender ID for testing**:
   ```
   SENDER_ID=12345
   ```

2. **Purchase a Vonage virtual number**:
   - Log in to your Vonage dashboard
   - Navigate to Numbers > Buy Numbers
   - Select a country and purchase a number with SMS capability
   - Use this number as your sender ID

3. **Register your alphanumeric sender ID**:
   - For US numbers: Register through the Vonage dashboard for A2P 10DLC compliance
   - For UK numbers: Alphanumeric sender IDs are generally allowed without pre-registration
   - For other countries: Check country-specific requirements in the Vonage documentation

### Message Not Delivered

**Error Message**: Message shows as sent but never arrives

**Causes**:
- Recipient's phone is off or has no signal
- Message blocked by carrier spam filters
- Invalid phone number format

**Solutions**:

1. **Verify the phone number format**:
   - Always use E.164 format (e.g., +12025550123)
   - Remove any spaces, dashes, or parentheses

2. **Check for carrier filtering**:
   - Use the Number Insight API to check if the number is valid and active
   - Consider using a dedicated virtual number instead of an alphanumeric sender ID

3. **Implement delivery receipts**:
   - Set `statusReportReq: true` when sending messages
   - Configure a webhook to receive delivery status updates

### Rate Limiting

**Error Message**: `Throughput Rate Exceeded` or `Too Many Requests`

**Solutions**:

1. **Implement exponential backoff**:
   - Start with a small delay (e.g., 1 second)
   - Double the delay on each retry
   - Set a maximum number of retries

2. **Batch your requests**:
   - Group multiple messages to the same recipient
   - Spread messages to different recipients over time

3. **Contact Vonage support**:
   - Request a higher throughput limit for your account

## Verify API Issues

### Verification Code Not Received

**Causes**:
- SMS delivery issues
- Rate limiting (too many verification attempts to the same number)
- Number is unable to receive SMS (landline, VoIP, etc.)

**Solutions**:

1. **Check the number type**:
   - Use the Number Insight API to verify the number is a mobile phone
   - Consider offering voice verification as an alternative

2. **Cancel existing verification requests**:
   - Only one verification can be active for a number at a time
   - Cancel any pending requests before creating a new one

3. **Increase the code expiry time**:
   - Set a longer TTL for the verification code

### Invalid Code Errors

**Causes**:
- User entered the wrong code
- Code has expired
- Too many failed attempts

**Solutions**:

1. **Implement clear error messages**:
   - Tell users how many attempts they have left
   - Indicate when a code has expired

2. **Allow code resending**:
   - Add a "Resend Code" option after a reasonable timeout
   - Cancel the old request before sending a new one

## Number Insight Issues

### Incomplete Information

**Causes**:
- Limited carrier data for certain regions
- Prepaid phones with limited information
- Recently ported numbers

**Solutions**:

1. **Use the appropriate level of insight**:
   - Basic: For simple validation
   - Standard: For carrier information
   - Advanced: For detailed information including roaming status

2. **Implement fallbacks**:
   - Don't rely solely on carrier information for critical decisions
   - Combine with other verification methods

## AWS Integration Issues

### Secrets Manager Access Denied

**Causes**:
- Insufficient IAM permissions
- Incorrect secret name
- Secret in different region

**Solutions**:

1. **Check IAM permissions**:
   - Ensure your Lambda function's execution role has `secretsmanager:GetSecretValue` permission
   - Verify the resource ARN in the policy matches your secret

2. **Verify secret name and region**:
   - Confirm the secret name matches what's in your code
   - Check that you're accessing the secret in the correct AWS region

### Lambda Timeouts

**Causes**:
- API calls taking too long
- Insufficient Lambda timeout setting

**Solutions**:

1. **Increase Lambda timeout**:
   - Set an appropriate timeout value (e.g., 10-30 seconds)
   - Consider the maximum response time of the Vonage APIs

2. **Implement caching**:
   - Cache API responses where appropriate
   - Use DynamoDB or ElastiCache for shared caching

## SDK Version Issues

### Incompatible Parameters

**Causes**:
- Using parameters that aren't supported in your SDK version
- API changes not reflected in documentation

**Solutions**:

1. **Check SDK version compatibility**:
   - Review the Vonage SDK changelog
   - Test parameters in isolation to identify incompatibilities

2. **Update to the latest SDK version**:
   ```bash
   npm update @vonage/server-sdk
   ```

3. **Use the correct parameter format**:
   - Some parameters use camelCase in newer versions
   - Others use snake_case or kebab-case

### Authentication Errors

**Causes**:
- Incorrect API key or secret
- Using basic auth when JWT is required (or vice versa)

**Solutions**:

1. **Verify credentials**:
   - Double-check your API key and secret
   - Ensure you're using the correct authentication method for each API

2. **Check for special characters**:
   - Ensure special characters in your API secret are properly encoded
   - Avoid line breaks or extra spaces in your credentials
