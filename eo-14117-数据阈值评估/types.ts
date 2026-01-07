
export type AccessScenario = 
  | 'Internal Staff (Combined)'
  | 'External App – Trustoo Email Popups'
  | 'External App – 17TRACK'
  | 'External App – QuickCEP';

export type RiskLevel = 'Critical' | 'High Risk' | 'Medium Risk' | 'Low Risk';

export interface DataEntry {
  id: string;
  asOfDate: string; // YYYY-MM-DD
  scenario: AccessScenario;
  
  // Numeric Inputs
  ipAddress: number;
  clientIdCookie: number;
  email: number;
  phoneNumber: number;
  name: number;
  address: number;
  zipCode: number;
  dateOfBirth: number;

  // Metadata
  lastUpdated: number;
}

export interface EvaluationResult {
  estimatedPersons: number;
  calcMethod: 'MIN(network_any, other_any)' | 'Zero (No Combination)';
  status: 'PASS' | 'FAIL';
  riskLevel: RiskLevel;
  utilization: number;
  gap: number;
  cpiTrigger: boolean;
  cpiExplanation: string;
  scopeExplanation: string;
}
