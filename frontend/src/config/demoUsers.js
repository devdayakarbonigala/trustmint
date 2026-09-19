/**
 * Centralized Demo Users Configuration for TrustMint
 * TEMPORARY DEMO AUTHENTICATION ONLY - Prepared for AWS Cognito integration.
 * Universal username credentials per specification.
 */

export const DEMO_USERS = [
  {
    id: 'usr_doc_1',
    name: 'Dr. Priya Sharma',
    username: 'doctor01',
    password: 'Doctor@123',
    role: 'doctor',
    roleTitle: 'Doctor',
    organization: 'Apollo Medical Center',
    avatar: 'PS',
  },
  {
    id: 'usr_pharm_1',
    name: 'Rajesh Verma',
    username: 'pharmacist01',
    password: 'Pharmacist@123',
    role: 'pharmacist',
    roleTitle: 'Pharmacist',
    organization: 'MedPlus Pharmacy',
    avatar: 'RV',
  },
  {
    id: 'usr_issuer_1',
    name: 'Dr. Anand Kulkarni',
    username: 'university01',
    password: 'Issuer@123',
    role: 'issuer',
    roleTitle: 'University Issuer',
    organization: 'Indian Institute of Technology',
    avatar: 'AK',
  },
  {
    id: 'usr_org_1',
    name: 'Neha Gupta',
    username: 'organizer01',
    password: 'Organizer@123',
    role: 'organizer',
    roleTitle: 'Event Organizer',
    organization: 'Global Tech Summits',
    avatar: 'NG',
  },
];
