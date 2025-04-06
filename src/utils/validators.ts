/**
 * Validates if a string is a valid E.164 phone number
 * E.164 format: + followed by country code and number, no spaces or special characters
 * 
 * @param phoneNumber - The phone number to validate
 * @returns boolean indicating if the phone number is valid
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber) return false;
  
  // E.164 format regex: + followed by 1 or more digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

/**
 * Validates if API credentials are present and valid
 * 
 * @param apiKey - Vonage API key
 * @param apiSecret - Vonage API secret
 * @returns boolean indicating if the credentials are valid
 */
export function validateApiCredentials(apiKey: string, apiSecret: string): boolean {
  if (!apiKey || !apiSecret) return false;
  if (typeof apiKey !== 'string' || typeof apiSecret !== 'string') return false;
  if (apiKey.trim() === '' || apiSecret.trim() === '') return false;
  
  return true;
}

/**
 * Validates if a string is a valid URL
 * 
 * @param url - The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export function validateUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates if a value is a valid JSON string
 * 
 * @param jsonString - The string to validate as JSON
 * @returns boolean indicating if the string is valid JSON
 */
export function validateJson(jsonString: string): boolean {
  if (!jsonString) return false;
  
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}
