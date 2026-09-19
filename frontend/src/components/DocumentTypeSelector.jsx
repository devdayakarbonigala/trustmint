import React from 'react';
import {
  Pill,
  GraduationCap,
  Ticket,
  Receipt,
  QrCode,
  IdCard,
} from 'lucide-react';

export const DOCUMENT_TYPES = [
  {
    id: 'prescription',
    name: 'Prescription',
    title: 'Medical Prescription',
    description: 'Medical Rx • Patient, Drugs & Doctor',
    icon: Pill,
    allowedRole: 'doctor',
    fields: [
      { key: 'patient', label: 'Patient Name', placeholder: 'e.g. Ravi Kumar', type: 'text', required: true },
      { key: 'drugs', label: 'Drugs', placeholder: 'e.g. Alprazolam, Diazepam (comma-separated)', type: 'text', required: true, isList: true },
      { key: 'doctor', label: 'Doctor Name', placeholder: 'e.g. Dr. Priya Sharma', type: 'text', required: true },
    ],
  },
  {
    id: 'certificate',
    name: 'Certificate',
    title: 'Academic Certificate',
    description: 'Degree Credential • Recipient, Course & Institution',
    icon: GraduationCap,
    allowedRole: 'issuer',
    fields: [
      { key: 'recipient', label: 'Recipient Name', placeholder: 'e.g. Aarav Sharma', type: 'text', required: true },
      { key: 'course', label: 'Course', placeholder: 'e.g. B.Tech Computer Science', type: 'text', required: true },
      { key: 'institution', label: 'Institution', placeholder: 'e.g. Indian Institute of Technology', type: 'text', required: true },
    ],
  },
  {
    id: 'ticket',
    name: 'Ticket',
    title: 'Event Ticket',
    description: 'Entry Ticket • Attendee, Event & Seat',
    icon: Ticket,
    allowedRole: 'organizer',
    fields: [
      { key: 'attendee', label: 'Attendee Name', placeholder: 'e.g. Sneha Patel', type: 'text', required: true },
      { key: 'event', label: 'Event Name', placeholder: 'e.g. AWS Cloud Summit 2026', type: 'text', required: true },
      { key: 'seat', label: 'Seat Number', placeholder: 'e.g. VIP-A14 (optional)', type: 'text', required: false },
    ],
  },
  {
    id: 'invoice',
    name: 'Invoice',
    title: 'Commercial Invoice',
    description: 'Billing Settlement • Biller, Payer & Amount',
    icon: Receipt,
    allowedRole: null, // all issuers
    fields: [
      { key: 'biller', label: 'Biller', placeholder: 'e.g. TrustMint Enterprise Solutions', type: 'text', required: true },
      { key: 'payer', label: 'Payer', placeholder: 'e.g. Apex Global Logistics', type: 'text', required: true },
      { key: 'amount', label: 'Amount', placeholder: 'e.g. 1500.00', type: 'text', required: true },
    ],
  },
  {
    id: 'event_pass',
    name: 'Event Pass',
    title: 'Access Event Pass',
    description: 'Gate Check-in • Attendee, Event & Gate',
    icon: QrCode,
    allowedRole: 'organizer',
    fields: [
      { key: 'attendee', label: 'Attendee Name', placeholder: 'e.g. Vikram Rao', type: 'text', required: true },
      { key: 'event', label: 'Event Name', placeholder: 'e.g. TechConf World 2026', type: 'text', required: true },
      { key: 'gate', label: 'Gate', placeholder: 'e.g. Gate 3 / North Entry', type: 'text', required: true },
    ],
  },
  {
    id: 'id_card',
    name: 'ID Card',
    title: 'Identity Card',
    description: 'Organization ID • Holder, Employee ID & Org',
    icon: IdCard,
    allowedRole: null, // all issuers
    fields: [
      { key: 'holder', label: 'Holder Name', placeholder: 'e.g. Ananya Sen', type: 'text', required: true },
      { key: 'employee_id', label: 'Employee ID', placeholder: 'e.g. EMP-20491', type: 'text', required: true },
      { key: 'organisation', label: 'Organisation', placeholder: 'e.g. TrustMint Research Labs', type: 'text', required: true },
    ],
  },
];

export function getDocTypeConfig(typeId) {
  return DOCUMENT_TYPES.find((t) => t.id === typeId) || DOCUMENT_TYPES[0];
}

export default function DocumentTypeSelector({ selectedType, onSelectType }) {
  return (
    <div className="type-selector-container">
      <div className="type-selector-header-row">
        <span className="type-selector-label">Select Document Type to Mint</span>
      </div>
      <div className="type-buttons-grid six-grid" role="radiogroup" aria-label="Document Type Selection">
        {DOCUMENT_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              id={`select-type-${type.id}`}
              role="radio"
              aria-checked={isSelected}
              className={`type-button ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectType(type.id)}
            >
              <div className="type-button-header">
                <Icon size={18} className="type-button-icon" />
                <span className="type-button-title">{type.name}</span>
              </div>
              <span className="type-button-meta">{type.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
