# Configuring a Bedrock Agent with Vonage SMS API

This guide walks through the process of setting up an Amazon Bedrock Agent that can send SMS messages using the Vonage SMS API.

## Step 1: Create a New Agent or Use Existing Agent

1. Navigate to the Amazon Bedrock console
2. Select "Agents" from the left navigation
3. Create a new agent or use an existing one
4. If creating new: Provide a name and description for your agent
5. Select a foundation model (Claude or Anthropic models work well)
6. Configure basic settings and click "Next"

## Step 2: Add the SMS Action Group

1. In the "Action groups" section, click "Add"
2. Enter the following details:
   - Name: `VonageSms`
   - Description: `Send SMS messages using Vonage API`
   - Definition method: Select "OpenAPI schema"
   - Schema: Upload or paste the contents of `openapi/send-sms.yaml`
3. In the "API URL" field, enter the URL of your deployed Lambda function
4. For authentication, select the appropriate method based on your API Gateway setup
5. Click "Create"

## Step 3: Configure Agent Instructions

Add the following instructions to help the agent understand when and how to use the SMS action:

```
You have access to an SMS messaging capability through the VonageSms action group.

When to use this capability:
- When a user asks to send a text message
- When a user wants to notify someone via SMS
- When a user needs to send a verification code or alert
- When a user explicitly mentions sending an SMS

Required parameters:
- from: The sender ID or phone number (must be enabled in your Vonage account)
- to: The recipient's phone number in E.164 format (e.g., +12025550123)
- text: The message content

Optional parameters:
- type: Message type (text, unicode, binary)
- ttl: Message time-to-live in milliseconds
- statusReportReq: Whether to request delivery receipts
- webhookUrl: URL for delivery receipt webhook
- webhookMethod: HTTP method for webhook (GET or POST)
- clientRef: Client reference for the message

Important considerations:
- The 'from' parameter must be a valid sender ID or phone number enabled in your Vonage account
- The recipient's phone number must be in E.164 format
- Message content should be concise and clear
- For international messages, consider time zones and language preferences
- Always confirm with the user before sending messages to avoid accidental sends

After sending an SMS, provide the message ID and status to the user.
```

## Step 4: Test the Agent

Use the following test prompts to verify your agent is working correctly:

1. "Send a text message to +12025550123 saying 'Hello from Bedrock Agent'"
2. "I need to notify John at +12025550123 that the meeting is canceled"
3. "Text +12025550123 with the verification code 123456"
4. "Send an SMS to +12025550123 to confirm their appointment tomorrow at 2pm"

## Example Conversation

**User**: I need to send a text message to +12025550123 to remind them about our meeting tomorrow.

**Agent**: I can help you send that SMS reminder. Could you please provide the exact message you'd like to send?

**User**: Please remind them that we have a team meeting at 3pm tomorrow in Conference Room B.

**Agent**: I'll send an SMS reminder to +12025550123. To confirm, the message will be:
"We have a team meeting at 3pm tomorrow in Conference Room B."

Is that correct? And what sender ID or phone number would you like to use for the "from" field?

**User**: Yes that's correct. Use "TeamReminder" as the sender.

**Agent**: I'll send that SMS now.

*[Agent calls the SMS API]*

**Agent**: Great! I've sent the SMS reminder to +12025550123 from "TeamReminder". 

Message details:
- Status: Success
- Message ID: 1a2b3c4d5e6f7g8h
- Delivery status: sent
- Sent at: 2023-04-05T23:15:30.000Z

The recipient should receive your message shortly.

## Advanced Configuration

For more sophisticated use cases, you can:

1. Create workflows that combine SMS with other actions (e.g., verify a phone number, then send an SMS)
2. Set up scheduled SMS reminders by integrating with AWS EventBridge
3. Implement two-way SMS conversations by configuring webhooks for incoming messages
4. Use templates for common message types to ensure consistency
