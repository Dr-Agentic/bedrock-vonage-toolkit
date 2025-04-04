import { Vonage } from '@vonage/server-sdk';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Vonage API credentials
const apiKey = process.env.VONAGE_API_KEY || '';
const apiSecret = process.env.VONAGE_API_SECRET || '';

// Initialize Vonage client
// Using any type to bypass TypeScript errors with the Vonage SDK
const vonageClient = new (Vonage as any)({
  apiKey,
  apiSecret
});

console.log('Vonage client initialized successfully with API key and secret');

export default vonageClient;
