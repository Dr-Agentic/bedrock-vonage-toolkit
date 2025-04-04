# Configuring a Bedrock Agent with Vonage Number Insight

This guide walks through the process of setting up an Amazon Bedrock Agent that can analyze phone numbers using the Vonage Number Insight API.

## Step 1: Create a New Agent

1. Navigate to the Amazon Bedrock console
2. Select "Agents" from the left navigation
3. Click "Create agent"
4. Provide a name and description for your agent
5. Select a foundation model (Claude or Anthropic models work well)
6. Configure basic settings and click "Next"

## Step 2: Add the Number Insight Action Group

1. In the "Action groups" section, click "Add"
2. Enter the following details:
   - Name: `VonageNumberInsight`
   - Description: `Analyze phone numbers for fraud detection and verification`
   - Definition method: Select "OpenAPI schema"
   - Schema: Upload or paste the contents of `openapi/number-insight.yaml`
3. In the "API URL" field, enter the URL of your deployed Lambda function
4. For authentication, select the appropriate method based on your API Gateway setup
5. Click "Create"

## Step 3: Configure Agent Instructions

Add the following instructions to help the agent understand when and how to use the Number Insight action:

```
You have access to a phone number analysis capability through the VonageNumberInsight action group.

When to use this capability:
- When a user asks about the validity or status of a phone number
- When a user wants to check if a phone number might be fraudulent
- When a user needs information about a phone's carrier or location
- When a user mentions SIM swap or phone number fraud concerns

The phone number must be in E.164 format (e.g., +12025550123). If the user provides a number in a different format, convert it to E.164 before using the action.

Important information you can provide from this analysis:
- Whether the number is valid and reachable
- If the SIM card has been recently swapped (potential fraud indicator)
- If the phone is currently roaming and in which country
- The carrier/network operator
- Whether the number has been ported recently
- A risk assessment score and recommendation

Always explain the results in a helpful, conversational way, focusing on the most relevant information based on the user's query.
```

## Step 4: Test the Agent

Use the following test prompts to verify your agent is working correctly:

1. "Can you check if +12025550123 is a valid phone number?"
2. "Is this number +12025550123 at risk of fraud?"
3. "What carrier is +12025550123 using?"
4. "Has +12025550123 had a recent SIM swap?"
5. "Tell me everything you can about +12025550123"

## Example Conversation

**User**: I received a suspicious call from +12025550123. Can you check if this number is legitimate?

**Agent**: I'll analyze that phone number for you. Let me check the details of +12025550123.

*[Agent calls the Number Insight API]*

**Agent**: I've analyzed the phone number +12025550123. Here's what I found:

- The number is valid and currently reachable
- It's registered with Verizon in the United States
- There has been no recent SIM swap detected (good sign)
- The number is not currently roaming
- The risk score is low (10 out of 100)

Based on this analysis, the number appears to be legitimate with no obvious fraud indicators. However, if the call seemed suspicious in other ways, you should still be cautious about sharing personal information.

Would you like me to check anything else about this number?

## Advanced Configuration

For more sophisticated use cases, you can:

1. Create additional action groups for other Vonage APIs (SMS, Voice, etc.)
2. Use knowledge bases to provide the agent with more context about phone fraud
3. Configure sequential workflows that combine multiple actions (e.g., analyze a number, then send an SMS if it's valid)
