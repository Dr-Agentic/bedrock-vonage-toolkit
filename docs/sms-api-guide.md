# SMS API Guide

This guide provides detailed information about using the SMS API functionality in the Bedrock Vonage Toolkit.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Sending SMS Messages](#sending-sms-messages)
- [SMS Parameters](#sms-parameters)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Sender ID Requirements](#sender-id-requirements)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Overview

The SMS API allows you to send text messages to users worldwide. It's useful for:

- Sending notifications
- Delivering one-time passwords
- Providing order updates
- Sending marketing messages (where permitted)
- Alerting users about important events

## Prerequisites

Before using the SMS API, ensure you have:

1. A Vonage account with sufficient credit
2. API key and secret configured in your environment
3. Appropriate sender ID (see [Sender ID Requirements](#sender-id-requirements))

## Sending SMS Messages

### Basic Usage

```javascript
const { SmsService } = require('./src/services/smsService');

async function sendMessage() {
  const smsService = new SmsService();
  
  const result = await smsService.sendSms(
    'YourApp',           // Sender ID
    '+12025550123',      // Recipient number (E.164 format)
    'Your message here'  // Message text
  );
  
  console.log(result);
}
```

### With Advanced Options

```javascript
const { SmsService } = require('./src/services/smsService');

async function sendAdvancedMessage() {
  const smsService = new SmsService();
  
  const result = await smsService.sendSms(
    'YourApp',           // Sender ID
    '+12025550123',      // Recipient number (E.164 format)
    'Your message here', // Message text
    {
      type: 'unicode',           // Support for non-Latin characters
      ttl: 3600000,              // Time-to-live in milliseconds (1 hour)
      statusReportReq: true,     // Request delivery receipt
      webhookUrl: 'https://your-webhook.com/delivery-receipt',
      webhookMethod: 'POST',
      clientRef: 'order-123'     // Your reference for this message
    }
  );
  
  console.log(result);
}
```

## SMS Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| from | string | Sender ID or phone number | Required |
| to | string | Recipient phone number in E.164 format | Required |
| text | string | Message content | Required |
| type | string | Message type: 'text', 'unicode', or 'binary' | 'text' |
| ttl | number | Time-to-live in milliseconds | 259200000 (3 days) |
| statusReportReq | boolean | Request delivery receipt | false |
| webhookUrl | string | URL for delivery receipt webhook | null |
| webhookMethod | string | HTTP method for webhook: 'GET' or 'POST' | 'POST' |
| clientRef | string | Your reference for this message | null |

### Parameter Details

#### Message Type

- **text**: Standard GSM 7-bit encoding (160 characters per message)
- **unicode**: Unicode encoding for non-Latin characters (70 characters per message)
- **binary**: Binary data (useful for specialized applications)

#### Time-to-Live (TTL)

The TTL parameter specifies how long the message should be valid for. If the message cannot be delivered within this time, it will be discarded.

#### Status Report

When `statusReportReq` is set to `true`, Vonage will send a delivery receipt to your webhook URL when the message status changes (delivered, failed, etc.).

## Response Format

The SMS API returns a response with the following structure:

```json
{
  "messageId": "1234567890",
  "to": "+12025550123",
  "status": {
    "code": "0",
    "message": "Success"
  },
  "remainingBalance": "10.5",
  "messagePrice": "0.0025",
  "network": "US-ACME",
  "deliveryStatus": "sent",
  "errorMessage": null,
  "timestamp": "2023-04-13T12:34:56.789Z",
  "messageCount": 1
}
```

### Status Codes

| Code | Message | Description |
|------|---------|-------------|
| 0 | Success | Message accepted for delivery |
| 1 | Throttled | You are sending messages too quickly |
| 2 | Missing Parameters | Required parameters are missing |
| 3 | Invalid Parameters | Parameters have invalid values |
| 4 | Invalid Credentials | API key or secret is incorrect |
| 5 | Internal Error | Error in Vonage platform |
| 6 | Invalid Message | Message content is invalid |
| 7 | Number Barred | The number is blacklisted |
| 8 | Partner Account Barred | Your account is suspended |
| 9 | Partner Quota Exceeded | You have insufficient credit |
| 10 | Too Many Existing Binds | Too many concurrent connections |
| 11 | Account Not Enabled For REST | Account not configured for REST API |
| 12 | Message Too Long | Message exceeds maximum length |
| 13 | Communication Failed | Communication with carrier failed |
| 14 | Invalid Signature | Invalid signature in request |
| 15 | Invalid Sender Address | Sender ID not allowed |
| 16 | Invalid TTL | TTL value is invalid |
| 19 | Facility Not Allowed | Requested facility not permitted |
| 20 | Invalid Message Class | Invalid message class |
| 23 | Bad Callback URL | Webhook URL is invalid |
| 29 | Non-Whitelisted Destination | Destination not in whitelist |
| 34 | Invalid or Missing MSISDN | Phone number is invalid |

## Error Handling

The SMS API may throw errors for various reasons. Here's how to handle them:

```javascript
try {
  const result = await smsService.sendSms(from, to, text, options);
  console.log('Message sent successfully:', result);
} catch (error) {
  console.error('Error sending message:', error);
  
  // Check for specific error types
  if (error.response) {
    const message = error.response.messages[0];
    
    switch (message.status) {
      case '15':
        console.error('Sender ID not allowed. Use a different sender ID or purchase a virtual number.');
        break;
      case '9':
        console.error('Insufficient credit. Please top up your account.');
        break;
      case '34':
        console.error('Invalid phone number. Check the format and try again.');
        break;
      default:
        console.error(`Error code ${message.status}: ${message['error-text']}`);
    }
  }
}
```

## Sender ID Requirements

Sender ID requirements vary by country:

### United States and Canada

- **Alphanumeric Sender IDs**: Not supported directly
- **Virtual Numbers**: Required for most use cases
- **Short Codes**: Available for high-volume messaging
- **10DLC Registration**: Required for A2P (Application-to-Person) messaging

### European Union

- **Alphanumeric Sender IDs**: Generally allowed (3-11 characters)
- **Virtual Numbers**: Supported
- **Pre-registration**: Required in some countries

### United Kingdom

- **Alphanumeric Sender IDs**: Allowed (3-11 characters)
- **Virtual Numbers**: Supported
- **Pre-registration**: Not required for most use cases

### Australia

- **Alphanumeric Sender IDs**: Allowed but must be registered
- **Virtual Numbers**: Supported
- **Pre-registration**: Required

### Asia

- **Requirements vary significantly by country**
- **Pre-registration**: Often required
- **Content Restrictions**: May apply

## Best Practices

### Message Content

1. **Keep messages concise**: SMS messages are limited to 160 characters (GSM-7) or 70 characters (Unicode)
2. **Include opt-out instructions**: For marketing messages, include "STOP to opt out"
3. **Identify yourself**: Start messages with your brand name
4. **Avoid URL shorteners**: Some carriers block messages with shortened URLs

### Timing and Frequency

1. **Respect local time**: Send messages during business hours in the recipient's time zone
2. **Limit frequency**: Avoid sending multiple messages in quick succession
3. **Implement rate limiting**: Stay within carrier and Vonage rate limits

### Technical Considerations

1. **Use delivery receipts**: Monitor message delivery status
2. **Implement retry logic**: Retry failed messages with exponential backoff
3. **Store message history**: Keep records of sent messages for troubleshooting
4. **Validate numbers**: Use the Number Insight API to validate numbers before sending

## Examples

### Simple Notification

```javascript
await smsService.sendSms(
  'YourApp',
  '+12025550123',
  'Your order #12345 has been shipped and will arrive tomorrow.'
);
```

### Unicode Message

```javascript
await smsService.sendSms(
  'YourApp',
  '+12025550123',
  '您的订单 #12345 已发货，明天到达。', // Chinese characters
  { type: 'unicode' }
);
```

### Marketing Message with Opt-out

```javascript
await smsService.sendSms(
  'YourApp',
  '+12025550123',
  'YourApp: 25% off all products this weekend! Shop now at example.com/sale. Reply STOP to unsubscribe.'
);
```

### Delivery Receipt Tracking

```javascript
await smsService.sendSms(
  'YourApp',
  '+12025550123',
  'Your verification code is 123456',
  {
    statusReportReq: true,
    webhookUrl: 'https://your-api.com/delivery-receipts',
    clientRef: 'verify-user-123'
  }
);
```
