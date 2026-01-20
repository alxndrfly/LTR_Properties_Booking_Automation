import React, { useState, useEffect } from 'react';
import BookingCalendar from './components/BookingCalendar';
import ErrorMessage from './components/ErrorMessage';
import './BookingPage.css';

const BookingPage: React.FC = () => {
  const [propertyName, setPropertyName] = useState<string>('');
  const [propertyLocation, setPropertyLocation] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get property details from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('property');
    const location = urlParams.get('location');

    if (!name || !location) {
      setError('Missing property information. Please return to the property listing.');
      return;
    }

    setPropertyName(decodeURIComponent(name));
    setPropertyLocation(decodeURIComponent(location).split(',').map(loc => loc.trim()));
  }, []);

  if (error) {
    return (
      <div className="booking-page">
        <header className="booking-page-header">
          <div className="logo-container">
            <img src="/logo_upscaled.png" alt="LTR Properties" className="logo-banner" />
          </div>
        </header>
        <main className="booking-page-main">
          <ErrorMessage message={error} />
          <div className="back-link-container">
            <button
              onClick={() => window.history.back()}
              className="back-link-button"
            >
              ← Back to Properties
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!propertyName || propertyLocation.length === 0) {
    return (
      <div className="booking-page">
        <header className="booking-page-header">
          <div className="logo-container">
            <img src="/logo_upscaled.png" alt="LTR Properties" className="logo-banner" />
          </div>
        </header>
        <main className="booking-page-main">
          <div className="loading-message">Loading booking information...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <header className="booking-page-header">
        <div className="logo-container">
          <img src="/logo_upscaled.png" alt="LTR Properties" className="logo-banner" />
        </div>
        <button
          onClick={() => window.history.back()}
          className="back-button"
        >
          ← Back
        </button>
      </header>
      <main className="booking-page-main">
        <BookingCalendar
          propertyName={propertyName}
          propertyLocation={propertyLocation}
        />
      </main>
    </div>
  );
};

export default BookingPage;
