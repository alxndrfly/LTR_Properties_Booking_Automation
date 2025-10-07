import React, { useEffect, useState } from 'react';
import './InquiryMerge.css';

const InquiryMerge: React.FC = () => {
  const [clientName, setClientName] = useState<string>('');
  const [propertyName, setPropertyName] = useState<string>('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('client_name');
    const property = urlParams.get('property_name');

    if (name) setClientName(name);
    if (property) setPropertyName(property);
  }, []);

  return (
    <div className="inquiry-merge-app">
      <header className="app-header">
        <div className="logo-container">
          <img src="/logo_upscaled.png" alt="LTR Properties" className="logo-banner" />
        </div>
      </header>

      <main className="app-main">
        <div className="success-container">
          <div className="success-content">
            <h2 className="success-title">Thank you {clientName}</h2>
            <p className="success-message">
              The property <strong>{propertyName}</strong> has been matched with this request.
            </p>
            <p className="success-message">
              Expect an email from us in the next minutes.
            </p>
            <p className="success-signature">The Long Term Rental Team</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InquiryMerge;
