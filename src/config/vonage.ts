import { Auth } from '@vonage/auth';
import { Vonage } from '@vonage/server-sdk';
import { Verify } from '@vonage/verify';
import { SMS } from '@vonage/sms';
import dotenv from 'dotenv';
import { SecretsManager } from 'aws-sdk';

// Load environment variables for local development
dotenv.config();

// Initialize SecretsManager client
const secretsManager = new SecretsManager();

/**
 * Get Vonage credentials from environment variables or AWS Secrets Manager
 * @returns Promise with API key and secret
 */
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

// Initialize clients (singleton pattern)
let vonageClient: Vonage | null = null;
let verifyClient: Verify | null = null;
let smsClient: SMS | null = null;

/**
 * Get initialized Vonage client
 * @returns Promise with Vonage client
 */
export async function getVonageClient(): Promise<Vonage> {
  if (!vonageClient) {
    const credentials = await getVonageCredentials();
    const auth = new Auth({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret
    });
    
    vonageClient = new Vonage(auth);
    console.log('Vonage client initialized successfully');
  }
  return vonageClient;
}

/**
 * Get initialized Verify client
 * @returns Promise with Verify client
 */
export async function getVerifyClient(): Promise<Verify> {
  if (!verifyClient) {
    const credentials = await getVonageCredentials();
    const auth = new Auth({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret
    });
    
    verifyClient = new Verify(auth);
    console.log('Verify client initialized successfully');
  }
  return verifyClient;
}

/**
 * Get initialized SMS client
 * @returns Promise with SMS client
 */
export async function getSmsClient(): Promise<SMS> {
  if (!smsClient) {
    const credentials = await getVonageCredentials();
    const auth = new Auth({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret
    });
    
    smsClient = new SMS(auth);
    console.log('SMS client initialized successfully');
  }
  return smsClient;
}

// Export all clients
export { Vonage, Verify, SMS };
