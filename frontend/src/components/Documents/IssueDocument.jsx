import React, { useState, useEffect } from 'react';
import { createDocument } from '../../config/api';
import DocumentCreated from './DocumentCreated';
import AccessRestricted from '../Layout/AccessRestricted';
import DocumentTypeSelector, { DOCUMENT_TYPES, getDocTypeConfig } from '../DocumentTypeSelector';
import {
  FilePlus,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function IssueDocument({
  user,
  roleConfig,
  onNavigateVerify,
  onNavigateDashboard,
}) {
  // Guard: Roles without issuing permissions cannot access this view
  if (!roleConfig.canIssue) {
    return (
      <AccessRestricted
        roleName={roleConfig.name}
        onBackToDashboard={onNavigateDashboard}
      />
    );
  }

  // Initial document type based on user role
  const initialType = roleConfig.primaryDocType || 'prescription';
  const [selectedType, setSelectedType] = useState(initialType);

  // Synchronize with role when changed
  useEffect(() => {
    if (roleConfig.primaryDocType) {
      setSelectedType(roleConfig.primaryDocType);
    }
  }, [roleConfig.primaryDocType]);

  // Step state: 1 (Details), 2 (Review), 3 (Generate / Done)
  const [currentStep, setCurrentStep] = useState(1);

  // Form field state - supports all 6 document types
  const [formData, setFormData] = useState({
    // Prescription
    patient: '',
    drugs: '',
    doctor: user?.name || '',

    // Certificate
    recipient: '',
    course: '',
    institution: user?.organization || '',

    // Ticket
    attendee: '',
    event: '',
    seat: '',

    // Invoice
    biller: user?.organization || user?.name || '',
    payer: '',
    amount: '',

    // Event Pass
    gate: '',

    // ID Card
    holder: '',
    employee_id: '',
    organisation: user?.organization || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mintResult, setMintResult] = useState(null);
  const [lastSubmittedPayload, setLastSubmittedPayload] = useState(null);

  const activeConfig = getDocTypeConfig(selectedType);
  const ActiveIcon = activeConfig.icon;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    setErrorMessage('');
  };

  /**
   * Validate and extract exact payload expected by AWS backend
   */
  const validateAndExtractPayload = () => {
    const payload = {};

    if (selectedType === 'prescription') {
      const patient = (formData.patient || '').trim();
      const rawDrugs = (formData.drugs || '').trim();
      const doctor = (formData.doctor || '').trim();

      if (!patient) throw new Error('Patient Name is required.');
      if (!rawDrugs) throw new Error('Drugs list is required.');
      if (!doctor) throw new Error('Doctor Name is required.');

      const drugsList = rawDrugs
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (drugsList.length === 0) throw new Error('Specify at least one medicine.');

      payload.patient = patient;
      payload.drugs = drugsList;
      payload.doctor = doctor;
    } else if (selectedType === 'certificate') {
      const recipient = (formData.recipient || '').trim();
      const course = (formData.course || '').trim();
      const institution = (formData.institution || '').trim();

      if (!recipient) throw new Error('Recipient Name is required.');
      if (!course) throw new Error('Course is required.');
      if (!institution) throw new Error('Institution is required.');

      payload.recipient = recipient;
      payload.course = course;
      payload.institution = institution;
    } else if (selectedType === 'ticket') {
      const attendee = (formData.attendee || '').trim();
      const event = (formData.event || '').trim();
      const seat = (formData.seat || '').trim();

      if (!attendee) throw new Error('Attendee Name is required.');
      if (!event) throw new Error('Event Name is required.');

      payload.attendee = attendee;
      payload.event = event;
      if (seat) payload.seat = seat;
    } else if (selectedType === 'invoice') {
      const biller = (formData.biller || '').trim();
      const payer = (formData.payer || '').trim();
      const rawAmount = (formData.amount || '').trim().replace(/[^0-9.]/g, '');

      if (!biller) throw new Error('Biller is required.');
      if (!payer) throw new Error('Payer is required.');
      if (!rawAmount) throw new Error('Valid Amount is required.');

      payload.biller = biller;
      payload.payer = payer;
      payload.amount = rawAmount;
    } else if (selectedType === 'event_pass') {
      const attendee = (formData.attendee || '').trim();
      const event = (formData.event || '').trim();
      const gate = (formData.gate || '').trim();

      if (!attendee) throw new Error('Attendee Name is required.');
      if (!event) throw new Error('Event Name is required.');
      if (!gate) throw new Error('Gate is required.');

      payload.attendee = attendee;
      payload.event = event;
      payload.gate = gate;
    } else if (selectedType === 'id_card') {
      const holder = (formData.holder || '').trim();
      const employee_id = (formData.employee_id || '').trim();
      const organisation = (formData.organisation || '').trim();

      if (!holder) throw new Error('Holder Name is required.');
      if (!employee_id) throw new Error('Employee ID is required.');
      if (!organisation) throw new Error('Organisation is required.');

      payload.holder = holder;
      payload.employee_id = employee_id;
      payload.organisation = organisation;
    }

    return payload;
  };

  const handleNextToReview = (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      validateAndExtractPayload();
      setCurrentStep(2);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleMint = async () => {
    setErrorMessage('');
    let payload;
    try {
      payload = validateAndExtractPayload();
    } catch (err) {
      setErrorMessage(err.message);
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    setCurrentStep(3);

    try {
      const result = await createDocument(selectedType, payload);
      setMintResult(result);
      setLastSubmittedPayload(payload);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to mint document. Please check connection.');
      setCurrentStep(2); // Return to review step on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetIssue = () => {
    setMintResult(null);
    setLastSubmittedPayload(null);
    setCurrentStep(1);
    setErrorMessage('');
  };

  return (
    <div className="issue-doc-container">
      {/* Top Navigation Bar with Back Button */}
      {onNavigateDashboard && !mintResult && (
        <div className="section-top-nav-bar">
          <button
            type="button"
            id="btn-back-to-dashboard-issue"
            className="btn-link-back"
            onClick={onNavigateDashboard}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {/* Step Indicator */}
      <div className="steps-indicator-bar">
        <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-circle">{currentStep > 1 ? <CheckCircle size={14} /> : '1'}</div>
          <span className="step-label">Details</span>
        </div>
        <div className={`step-line ${currentStep >= 2 ? 'active' : ''}`} />
        <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-circle">{currentStep > 2 ? <CheckCircle size={14} /> : '2'}</div>
          <span className="step-label">Review</span>
        </div>
        <div className={`step-line ${currentStep >= 3 ? 'active' : ''}`} />
        <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-circle">3</div>
          <span className="step-label">Generate</span>
        </div>
      </div>

      {/* Main Issue Card */}
      {!mintResult ? (
        <div className="panel-card issue-panel-card">
          <div className="panel-header">
            <div>
              <div className="panel-badge">
                <FilePlus size={14} />
                <span>Issue Document</span>
              </div>
              <h2 className="panel-title">{activeConfig.title}</h2>
              <p className="panel-subtitle">{activeConfig.description}</p>
            </div>
          </div>

          {errorMessage && (
            <div className="error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Dynamic Details Entry */}
          {currentStep === 1 && (
            <div>
              {/* Document Type Selector (Allows selecting all 6 types) */}
              <DocumentTypeSelector
                selectedType={selectedType}
                onSelectType={handleTypeSelect}
              />

              <form onSubmit={handleNextToReview} className="issue-form">
                <div className="form-section-header">
                  <div className="form-type-badge-indicator">
                    <ActiveIcon size={16} />
                    <span>{activeConfig.name} Information</span>
                  </div>
                </div>

                {/* Dynamically Render Form Fields for the Selected Document Type */}
                {activeConfig.fields.map((field) => (
                  <div key={field.key} className="form-group">
                    <label className="form-label" htmlFor={`input-${field.key}`}>
                      {field.label}
                      {field.required && <span className="required-badge">* Required</span>}
                    </label>
                    <input
                      id={`input-${field.key}`}
                      className="form-input"
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      required={field.required}
                    />
                  </div>
                ))}

                <div className="form-actions-row">
                  {onNavigateDashboard && (
                    <button
                      type="button"
                      id="btn-cancel-issue"
                      className="btn-secondary"
                      onClick={onNavigateDashboard}
                    >
                      <span>Cancel</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    id="btn-next-review"
                    className="btn-primary"
                  >
                    <span>Continue to Review</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Review & Confirmation */}
          {currentStep === 2 && (
            <div className="review-step-container">
              <div className="review-header">
                <h3 className="review-title">Review Document Details</h3>
                <p className="review-subtitle">
                  Verify the parameters below before minting to the TrustMint cryptographic ledger.
                </p>
              </div>

              <div className="review-card">
                <div className="review-card-top">
                  <div className="review-type-indicator">
                    <ActiveIcon size={20} />
                    <div>
                      <span className="review-type-label">Document Type</span>
                      <h4 className="review-type-name">{activeConfig.title}</h4>
                    </div>
                  </div>
                  <span className="review-ready-badge">Ready to Mint</span>
                </div>

                <div className="review-fields-grid">
                  {activeConfig.fields.map((field) => {
                    const val = formData[field.key];
                    return (
                      <div key={field.key} className="review-field-item">
                        <span className="review-field-label">{field.label}</span>
                        <span className="review-field-value">
                          {val || <span className="text-muted">Not specified</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="review-actions-row">
                <button
                  type="button"
                  id="btn-back-to-edit"
                  className="btn-secondary"
                  onClick={() => setCurrentStep(1)}
                  disabled={isLoading}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Edit</span>
                </button>

                <button
                  type="button"
                  id="btn-confirm-mint"
                  className="btn-primary"
                  onClick={handleMint}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner" />
                      <span>Minting Document...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generate Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Loading Indicator */}
          {currentStep === 3 && isLoading && (
            <div className="generating-loader-card">
              <div className="spinner-large" />
              <h3 className="generating-title">Generating Cryptographic Credential</h3>
              <p className="generating-subtitle">
                Computing SHA-256 fingerprint, evaluating Bedrock AI checks, and minting just-in-time...
              </p>
            </div>
          )}
        </div>
      ) : (
        /* STEP 3 DONE: Document Created Successfully View */
        <DocumentCreated
          createdData={mintResult}
          payloadData={lastSubmittedPayload}
          documentType={selectedType}
          user={user}
          onNavigateVerify={roleConfig.canVerify ? onNavigateVerify : null}
          onResetIssue={handleResetIssue}
          onNavigateDashboard={onNavigateDashboard}
        />
      )}
    </div>
  );
}
