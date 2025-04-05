import { Vonage } from '@vonage/server-sdk';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { SecretsManager } from 'aws-sdk';

// Load environment variables for local development
dotenv.config();

// Initialize SecretsManager client
const secretsManager = new SecretsManager();

// Function to get Vonage credentials
async function getVonageCredentials(): Promise<{ apiKey: string; apiSecret: string }> {
  // For local development, use environment variables if available
  if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET) {
    console.log('Using Vonage credentials from environment variables');
    return {
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET
    };
  }

  // For AWS environment, get credentials from Secrets Manager
  try {
    const secretName = process.env.VONAGE_CREDENTIALS_SECRET_NAME;
    if (!secretName) {
      throw new Error('VONAGE_CREDENTIALS_SECRET_NAME environment variable is not set');
    }

    console.log(`Retrieving Vonage credentials from Secrets Manager: ${secretName}`);
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    
    if (!data.SecretString) {
      throw new Error('Secret string is empty');
    }

    const secret = JSON.parse(data.SecretString);
    return {
      apiKey: secret.VONAGE_API_KEY,
      apiSecret: secret.VONAGE_API_SECRET
    };
  } catch (error) {
    console.error('Error retrieving Vonage credentials from Secrets Manager:', error);
    throw error;
  }
}

// Initialize Vonage client with placeholder values
// Will be updated with actual credentials before use
let vonageClient: any = null;

// Export an async function to get the initialized client
export async function getVonageClient() {
  if (!vonageClient) {
    const credentials = await getVonageCredentials();
    vonageClient = new (Vonage as any)({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret
    });
    console.log('Vonage client initialized successfully with API key and secret');
  }
  return vonageClient;
}

// For backward compatibility with existing code
export default {
  numberInsights: {
    advancedLookup: async (number: string) => {
      const client = await getVonageClient();
      return client.numberInsights.advancedLookup(number);
    }
  },
  verify: {
    request: async (params: any, callback: any) => {
      const client = await getVonageClient();
      return client.verify.request(params, callback);
    },
    check: async (params: any, callback: any) => {
      const client = await getVonageClient();
      return client.verify.check(params, callback);
    },
    control: async (params: any, callback: any) => {
      const client = await getVonageClient();
      return client.verify.control(params, callback);
    }
  }
};
