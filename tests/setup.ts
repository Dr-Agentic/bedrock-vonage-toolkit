import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Set default environment variables for testing
process.env.NODE_ENV = 'test';

// Mock environment variables if not set
if (!process.env.VONAGE_API_KEY) {
  process.env.VONAGE_API_KEY = 'test_api_key';
}

if (!process.env.VONAGE_API_SECRET) {
  process.env.VONAGE_API_SECRET = 'test_api_secret';
}

if (!process.env.TEST_PHONE_NUMBER) {
  process.env.TEST_PHONE_NUMBER = '+12025550142';
}

// Global test setup and teardown is handled by Jest configuration
