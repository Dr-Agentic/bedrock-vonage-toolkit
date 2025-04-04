import { Vonage } from '@vonage/server-sdk';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Vonage API credentials
const apiKey = process.env.VONAGE_API_KEY || '';
const apiSecret = process.env.VONAGE_API_SECRET || '';
const applicationId = process.env.VONAGE_APPLICATION_ID || '';
const privateKeyPath = process.env.VONAGE_PRIVATE_KEY || '';

// Initialize Vonage client
let vonageClient: Vonage;

try {
  if (privateKeyPath && applicationId) {
    // For APIs that require application authentication (Voice, Messages, etc.)
    const privateKey = fs.readFileSync(path.resolve(privateKeyPath));
    
    vonageClient = new Vonage({
      apiKey,
      apiSecret,
      applicationId,
      privateKey
    });
  } else {
    // For APIs that only require API key & secret (SMS, Verify, etc.)
    vonageClient = new Vonage({
      apiKey,
      apiSecret
    });
  }
} catch (error) {
  console.error('Failed to initialize Vonage client:', error);
  throw new Error('Vonage client initialization failed');
}

export default vonageClient;
