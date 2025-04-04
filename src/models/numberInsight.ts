/**
 * Types for Number Insight API responses
 */

export interface BasicInsightResponse {
  status: string;
  status_message: string;
  request_id: string;
  international_format_number: string;
  national_format_number: string;
  country_code: string;
  country_code_iso3: string;
  country_name: string;
  country_prefix: string;
}

export interface StandardInsightResponse extends BasicInsightResponse {
  current_carrier?: {
    network_code: string;
    name: string;
    country: string;
    network_type: string;
  };
  original_carrier?: {
    network_code: string;
    name: string;
    country: string;
    network_type: string;
  };
  ported: string;
  roaming: {
    status: string;
  };
}

export interface AdvancedInsightResponse extends StandardInsightResponse {
  valid: string;
  reachable: string;
  ported_status: string;
  roaming_status: string;
  roaming_country_code: string;
  roaming_network_code: string;
  roaming_network_name: string;
  caller_identity: {
    caller_type: string;
    caller_name: string;
    first_name: string;
    last_name: string;
  };
  caller_name: string;
  caller_type: string;
  first_name: string;
  last_name: string;
  lookup_outcome: number;
  lookup_outcome_message: string;
  ip_match_level: string;
  ip_country: string;
  ip_warnings: string[];
  risk_score: number;
  risk_recommendation: string;
  device_model: string;
  device_brand: string;
  device_os: string;
  original_network: string;
}

export interface SimSwapResponse {
  request_id: string;
  number: string;
  swapped: boolean;
  swap_timestamp?: string;
  days_since_swap?: number;
}

export interface ComprehensiveNumberInsight {
  phoneNumber: string;
  basicInfo: {
    internationalFormat: string;
    nationalFormat: string;
    countryCode: string;
    countryName: string;
    countryPrefix: string;
  };
  carrierInfo: {
    name: string;
    country: string;
    networkType: string;
    networkCode: string;
  };
  validity: {
    valid: boolean;
    reachable: boolean;
    ported: boolean;
    roaming: boolean;
  };
  simSwapInfo: {
    swapped: boolean;
    swapTimestamp: string | null;
    daysSinceSwap: number;
  };
  advancedDetails: {
    roamingInfo: {
      status: string;
      countryCode: string;
      networkName: string;
      networkCode: string;
    };
    portingInfo: {
      status: string;
      originalNetwork: string;
    };
    ipInfo: {
      ipMatchLevel: string;
      ipCountry: string;
      ipWarnings: string[];
    };
    deviceInfo: {
      deviceModel: string;
      deviceBrand: string;
      deviceOs: string;
    };
    callerIdentity: {
      callerName: string;
      callerType: string;
      firstName: string;
      lastName: string;
    };
  };
  riskScore: {
    score: number;
    recommendation: string;
  };
  timestamp: string;
  rawData: {
    basic: BasicInsightResponse;
    standard: StandardInsightResponse;
    advanced: AdvancedInsightResponse;
    simSwap: SimSwapResponse;
  };
}
