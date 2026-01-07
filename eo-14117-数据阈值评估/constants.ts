
import { AccessScenario } from './types';

export const BULK_THRESHOLD = 100000;

export const SCENARIOS: AccessScenario[] = [
  'Internal Staff (Combined)',
  'External App – Trustoo Email Popups',
  'External App – 17TRACK',
  'External App – QuickCEP'
];

export const INITIAL_ENTRY_STATE = {
  asOfDate: new Date().toISOString().slice(0, 10),
  scenario: 'Internal Staff (Combined)' as AccessScenario,
  ipAddress: 0,
  clientIdCookie: 0,
  email: 0,
  phoneNumber: 0,
  name: 0,
  address: 0,
  zipCode: 0,
  dateOfBirth: 0,
};
