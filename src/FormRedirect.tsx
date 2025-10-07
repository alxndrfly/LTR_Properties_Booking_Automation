import React from 'react';
import './FormRedirect.css';

const FormRedirect: React.FC = () => {
  const getClientNameFromUrl = (): string => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('client_name') || 'Customer';
  };

  const clientName = getClientNameFromUrl();

  return (
    <div className="form-redirect-app">
      <header className="app-header">
        <div className="logo-container">
          <img src="/logo_upscaled.png" alt="LTR Properties" className="logo-banner" />
        </div>
      </header>

      <main className="form-redirect-main">
        <div className="thank-you-container">
          <div className="thank-you-content">
            <p className="thank-you-greeting">Dear {clientName},</p>
            <p className="thank-you-message">
              Thank you for submitting your inquiry. The team will reach out to you via email shortly.
            </p>
            <p className="thank-you-signature">The Long Term Rental Team</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FormRedirect;
