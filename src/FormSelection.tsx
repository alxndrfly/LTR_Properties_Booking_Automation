import React, { useState, useEffect } from 'react';
import { FormSelectionPayload, LoadingState } from './types';
import { fetchFormData } from './services/airtable';
import FormContainer from './components/FormContainer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import PersonalizedGreeting from './components/PersonalizedGreeting';
import './FormSelection.css';

const FormSelection: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  });
  const [formPayload, setFormPayload] = useState<FormSelectionPayload | null>(null);

  const getUuidFromUrl = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('uuid');
  };

  const loadData = async () => {
    try {
      setLoadingState({ isLoading: true, error: null });

      // Get UUID from URL parameter
      const uuid = getUuidFromUrl();
      if (!uuid) {
        throw new Error('No UUID provided in the URL. Please add ?uuid=your-uuid-here to the URL.');
      }

      // Fetch form data from Netlify Function
      const payload = await fetchFormData(uuid);
      setFormPayload(payload);

      setLoadingState({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setLoadingState({ isLoading: false, error: errorMessage });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loadingState.isLoading) {
    return (
      <div className="form-selection-app">
        <header className="app-header">
          <div className="logo-container">
            <img src="/logo_upscaled.png" alt="LTR Properties" className="logo-banner" />
          </div>
        </header>
        <main className="app-main">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (loadingState.error) {
    return (
      <div className="form-selection-app">
        <header className="app-header">
          <div className="logo-container">
            <img src="/logo_upscaled.png" alt="LTR Properties" className="logo-banner" />
          </div>
        </header>
        <main className="app-main">
          <ErrorMessage message={loadingState.error} />
        </main>
      </div>
    );
  }

  if (!formPayload) {
    return (
      <div className="form-selection-app">
        <header className="app-header">
          <div className="logo-container">
            <img src="/logo_upscaled.png" alt="LTR Properties" className="logo-banner" />
          </div>
        </header>
        <main className="app-main">
          <ErrorMessage message="No data available" />
        </main>
      </div>
    );
  }

  const renderInstructionMessage = () => {
    return (
      <>
        We thank you for your interest in <strong>{formPayload.inquired_property_name}</strong>.
        <br /><br />
        Please tell us which enquiry to associate this property with.
        <br /><br />
        To continue, simply <strong>select the profile</strong> that best matches this request, or <strong>create a new one</strong> if you'd like to submit a new inquiry.
      </>
    );
  };

  const handleCreateNewInquiry = () => {
    const tallyUrl = `https://tally.so/r/mY2e7B?inquiry_id=${formPayload.current_inquiry_id}&client_name=${formPayload.client_name}`;
    window.location.href = tallyUrl;
  };

  const handleSelectInquiry = async (formId: string, linkedInquiryId: string) => {
    try {
      const payload = {
        client_id: formPayload.client_id,
        current_inquiry_id: formPayload.current_inquiry_id,
        selected_inquiry_id: linkedInquiryId,
        selected_form_id: formId
      };

      const response = await fetch('https://n8n.api-sync.xyz/webhook/merge-inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry selection');
      }

      // Redirect to success page
      const redirectUrl = `/inquiry_merge?client_name=${encodeURIComponent(formPayload.client_name)}&property_name=${encodeURIComponent(formPayload.inquired_property_name)}`;
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Error selecting inquiry:', error);
      // Optionally show error message to user
    }
  };

  return (
    <div className="form-selection-app">
      <header className="app-header">
        <div className="logo-container">
          <img src="/logo_upscaled.png" alt="LTR Properties" className="logo-banner" />
        </div>
      </header>

      <main className="app-main">
        <section className="form-selection-section">
          <PersonalizedGreeting
            firstName={formPayload.client_name}
            statusMessage={renderInstructionMessage()}
          />

          <div className="signature-message">
            The Long Term Rental Team
          </div>

          <div className="new-inquiry-section">
            <div className="new-inquiry-header">
              <h3 className="new-inquiry-title">New Inquiry</h3>
              <div className="new-inquiry-title-underline"></div>
            </div>
            <div className="new-inquiry-content">
              <p className="new-inquiry-text">Starting fresh? Create a new inquiry now.</p>
              <button className="new-inquiry-button" onClick={handleCreateNewInquiry}>CREATE A NEW INQUIRY</button>
            </div>
          </div>

          <p className="separator-text">or select an existing inquiry</p>

          <div className="forms-grid">
            {formPayload.forms.map((form, index) => (
              <FormContainer
                key={form.form_id}
                form={form}
                formIndex={index}
                onSelectInquiry={handleSelectInquiry}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default FormSelection;
