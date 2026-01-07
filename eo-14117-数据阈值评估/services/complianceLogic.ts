
import { DataEntry, EvaluationResult, RiskLevel } from '../types';
import { BULK_THRESHOLD } from '../constants';

/**
 * Calculates the compliance evaluation based on EO 14117 bulk data threshold rules.
 * Core Logic:
 * 1. Identify Network Identifiers (IP, Cookie)
 * 2. Identify Demographic/Contact Identifiers (Name, Email, etc.)
 * 3. Combination Trigger: Requires at least one from each group.
 * 4. Combination Count: The intersection (MIN) of the two groups' maximum coverage.
 */
export const calculateEvaluation = (entry: Omit<DataEntry, 'id' | 'lastUpdated'>): EvaluationResult => {
  const {
    ipAddress,
    clientIdCookie,
    email,
    phoneNumber,
    name,
    address,
    zipCode,
    dateOfBirth,
    scenario
  } = entry;

  // 3.1 & 3.4: Group Identifiers and calculate intermediate aggregates (MAX per group)
  // network_any = MAX(IP count, Cookie count)
  const network_any = Math.max(ipAddress, clientIdCookie);
  
  // other_any = MAX(Name, Email, Phone, Address, ZIP, Date of Birth counts)
  const other_any = Math.max(email, phoneNumber, name, address, zipCode, dateOfBirth);
  
  // 3.2: CPI Combination Trigger Rule
  // YES if both groups have at least one identifier present
  const cpiTrigger = network_any > 0 && other_any > 0;

  // 3.3 & 3.4: Estimated Combination Count Calculation
  // If no combination is triggered, count is 0. Otherwise, it is the MIN of the two groups.
  let estimatedPersons = 0;
  let calcMethod: EvaluationResult['calcMethod'] = 'Zero (No Combination)';

  if (cpiTrigger) {
    // combination_count = MIN(network_any, other_any)
    estimatedPersons = Math.min(network_any, other_any);
    calcMethod = 'MIN(network_any, other_any)';
  } else {
    // If CPI Combination Trigger = NO, combination_count = 0
    estimatedPersons = 0;
    calcMethod = 'Zero (No Combination)';
  }

  // 3.5: Threshold Judgment (PASS/FAIL, Gap, Utilization)
  const utilization = (estimatedPersons / BULK_THRESHOLD) * 100;
  const status = estimatedPersons >= BULK_THRESHOLD ? 'FAIL' : 'PASS';
  const gap = BULK_THRESHOLD - estimatedPersons;

  // Updated Risk Level Grading based on requirements:
  // Low: <= 20%
  // Medium: > 20% and <= 40%
  // High: > 40%
  let riskLevel: RiskLevel = 'Low Risk';
  if (utilization > 40) {
    riskLevel = 'High Risk';
  } else if (utilization > 20) {
    riskLevel = 'Medium Risk';
  } else {
    riskLevel = 'Low Risk';
  }

  // Explanation Generation aligned with legal requirements
  let cpiExplanation = '';
  if (cpiTrigger) {
    cpiExplanation = `EO 14117 Combination Identified: Estimated intersection between Network data (${network_any.toLocaleString()}) and Demographic data (${other_any.toLocaleString()}).`;
  } else if (network_any === 0 && other_any === 0) {
    cpiExplanation = 'No identifier data provided for combination assessment.';
  } else if (network_any > 0) {
    cpiExplanation = 'Combination Trigger: NO. Only Network identifiers detected; Demographic/Contact data is required to form a Covered Combination.';
  } else {
    cpiExplanation = 'Combination Trigger: NO. Only Demographic/Contact identifiers detected; Network data is required to form a Covered Combination.';
  }

  const scopeExplanation = scenario === 'Internal Staff (Combined)'
    ? 'Aggregate across all internal staff'
    : 'Assessed per external application';

  return {
    estimatedPersons,
    calcMethod,
    status,
    riskLevel,
    utilization,
    gap,
    cpiTrigger,
    cpiExplanation,
    scopeExplanation
  };
};
