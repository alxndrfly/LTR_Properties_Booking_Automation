import React, { useState, useEffect } from 'react';
import { JsonPayload, Property, LoadingState, StatusMessage } from './types';
import { fetchJsonPayload, fetchPropertiesWithImages } from './services/airtable';
import PropertyCard from './components/PropertyCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import './App.css';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  });
  const [jsonPayload, setJsonPayload] = useState<JsonPayload | null>(null);
  const [requestedProperty, setRequestedProperty] = useState<Property | null>(null);
  const [recommendedProperties, setRecommendedProperties] = useState<Property[]>([]);

  const getUuidFromUrl = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('uuid');
  };

  const getStatusMessage = (statusCode: string): string => {
    const messages: { [key: string]: string } = {
      'ok': 'Property is available!',
      'no_pets_requirement': 'Available - No pets required',
      'not_available': 'Property not available',
      'duration_mismatch': 'Duration requirements not met',
      'duration_mismatch_annual': 'Duration requirements not met',
      'no_pets_allowed': 'Pets not allowed'
    };
    return messages[statusCode] || statusCode;
  };

  const isPropertyAccepted = (statusCode: string): boolean => {
    return statusCode === 'ok' || statusCode === 'no_pets_requirement';
  };

  const loadData = async () => {
    try {
      setLoadingState({ isLoading: true, error: null });

      const uuid = getUuidFromUrl();
      if (!uuid) {
        throw new Error('No UUID provided in the URL. Please add ?uuid=your-uuid-here to the URL.');
      }

      const payload = await fetchJsonPayload(uuid);
      setJsonPayload(payload);

      const propertyIds = [
        payload.property_inquired.id,
        ...payload.algo_top4_properties.map(p => p.id)
      ];

      const propertiesWithImages = await fetchPropertiesWithImages(propertyIds);

      const requestedProp = propertiesWithImages.find(p => p.id === payload.property_inquired.id);
      if (requestedProp) {
        setRequestedProperty(requestedProp);
      }

      const recommendedProps = propertiesWithImages.filter(p =>
        payload.algo_top4_properties.some(algoProp => algoProp.id === p.id)
      );
      setRecommendedProperties(recommendedProps);

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
      <div className="app">
        <header className="app-header">
          <div className="logo-container">
            <h1 className="logo">LTR Properties</h1>
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
      <div className="app">
        <header className="app-header">
          <div className="logo-container">
            <h1 className="logo">LTR Properties</h1>
          </div>
        </header>
        <main className="app-main">
          <ErrorMessage message={loadingState.error} />
        </main>
      </div>
    );
  }

  if (!jsonPayload) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="logo-container">
            <h1 className="logo">LTR Properties</h1>
          </div>
        </header>
        <main className="app-main">
          <ErrorMessage message="No data available" />
        </main>
      </div>
    );
  }

  const isAccepted = isPropertyAccepted(jsonPayload.property_inquired_message);
  const statusMessage = getStatusMessage(jsonPayload.property_inquired_message);

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-container">
          <h1 className="logo">LTR Properties</h1>
        </div>
      </header>

      <main className="app-main">
        <section className="requested-property-section">
          <div className="section-header">
            <h2 className="section-title">Your Requested Property</h2>
            <p className="section-subtitle">We'll update this message later</p>
          </div>

          {requestedProperty && (
            <div className="requested-property-container">
              <PropertyCard
                property={requestedProperty}
                isGrayedOut={!isAccepted}
                statusMessage={statusMessage}
                showBookButton={false}
              />
            </div>
          )}
        </section>

        {recommendedProperties.length > 0 && (
          <section className="recommended-properties-section">
            <div className="section-header">
              <h2 className="section-title">Recommended Properties</h2>
              <p className="section-subtitle">Top picks based on your preferences</p>
            </div>

            <div className="properties-grid">
              {recommendedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  showBookButton={true}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default App;