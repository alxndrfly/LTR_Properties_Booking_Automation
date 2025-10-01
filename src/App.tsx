import React, { useState, useEffect } from 'react';
import { JsonPayload, Property, LoadingState } from './types';
import { fetchRecommendations } from './services/airtable';
import PropertyCard from './components/PropertyCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import PersonalizedGreeting from './components/PersonalizedGreeting';
import './App.css';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  });
  const [jsonPayload, setJsonPayload] = useState<JsonPayload | null>(null);
  const [requestedProperty, setRequestedProperty] = useState<Property | null>(null);
  const [recommendedProperties, setRecommendedProperties] = useState<Property[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const getUuidFromUrl = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('uuid');
  };

  const getStatusMessage = (statusCode: string, algoMessage: string, showRecs: boolean, isAccepted: boolean): string => {
    const baseMessages: { [key: string]: string } = {
      'ok': 'Your requested property is available and is pet friendly. Book a viewing with one of our agents below.',
      'no_pets_requirement': 'Your requested property is available. Book a viewing with one of our agents below.',
      'no_pets_allowed': 'Your requested property does not accept pets.',
      'not_available': 'I\'m sorry, the property you requested is no longer available.',
      'duration_mismatch_seasonal': 'Your requested property is only available for seasonal rental while you inquired about annual rental.',
      'duration_mismatch_annual': 'Your requested property is only available for annual rental while you inquired about seasonal rental.',
      'duration_mismatch': 'Your requested property\'s rental duration does not match your request.'
    };

    // If property is not accepted and there are recommendations, only show recommendations message
    if (!isAccepted && showRecs) {
      return getRecommendationsMessage(algoMessage);
    }

    let message = baseMessages[statusCode] || statusCode;

    // Append recommendations message if applicable and property is accepted
    if (showRecs && isAccepted) {
      const recMessage = getRecommendationsMessage(algoMessage);
      if (recMessage) {
        message += '\n\n' + recMessage;
      }
    }

    return message;
  };


  const isPropertyAccepted = (statusCode: string): boolean => {
    return statusCode === 'ok' || statusCode === 'no_pets_requirement';
  };

  const getRecommendationsMessage = (algoMessage: string): string => {
    const messages: { [key: string]: string } = {
      'general_recs': 'Our team has handpicked properties based on your inquiry.\nYou can find them below and book a viewing with one of our agents.',
      'pets_list_populated': 'Our team has handpicked pet-friendly properties based on your inquiry.\nYou can find them below and book a viewing with one of our agents.',
      'pets_list_partial': 'Our team has handpicked pet-friendly properties based on your inquiry.\nYou can find them below and book a viewing with one of our agents.',
      'pets_list_empty': ''
    };
    return messages[algoMessage] || 'Our team has handpicked properties based on your inquiry.\nYou can find them below and book a viewing with one of our agents.';
  };

  const shouldShowRecommendations = (algoMessage: string, algoTopProperties: Property[]): boolean => {
    return algoMessage !== 'pets_list_empty' && algoTopProperties.length > 0;
  };

  const processPropertyImages = (property: Property): Property => {
    // Convert Fotos array of objects to images array of URLs and store dimensions
    if (property.Fotos && Array.isArray(property.Fotos)) {
      property.images = property.Fotos.map((foto: any) => {
        // Extract URL from the foto object
        return typeof foto === 'string' ? foto : foto.url;
      });

      // Store first image dimensions for initial height calculation
      const firstFoto = property.Fotos[0];
      if (property.Fotos.length > 0 && typeof firstFoto !== 'string' && firstFoto.width && firstFoto.height) {
        property.firstImageDimensions = {
          width: firstFoto.width,
          height: firstFoto.height,
          aspectRatio: firstFoto.width / firstFoto.height
        };
      }
    }
    return property;
  };

  const preloadFirstImages = async (properties: Property[]): Promise<void> => {
    // Collect first image from each property
    const imagesToPreload: string[] = [];

    properties.forEach(property => {
      if (property.images && property.images.length > 0) {
        imagesToPreload.push(property.images[0]);
      }
    });

    // Preload all first images
    const imagePromises = imagesToPreload.map(src => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => resolve(src); // Resolve anyway to not block
        img.src = src;
      });
    });

    await Promise.all(imagePromises);
  };

  const loadData = async () => {
    try {
      setLoadingState({ isLoading: true, error: null });
      setImagesLoaded(false);

      // Get UUID from URL parameter
      const uuid = getUuidFromUrl();
      if (!uuid) {
        throw new Error('No UUID provided in the URL. Please add ?uuid=your-uuid-here to the URL.');
      }

      // Fetch complete data from n8n webhook (via Netlify Function)
      // This returns all data in one call including property details and images
      const payload = await fetchRecommendations(uuid);
      setJsonPayload(payload);

      // Set requested property and process images
      let processedRequestedProperty: Property | null = null;
      if (payload.property_inquired) {
        processedRequestedProperty = processPropertyImages(payload.property_inquired);
        setRequestedProperty(processedRequestedProperty);
      }

      // Set recommended properties and process images for each
      let processedRecommendedProperties: Property[] = [];
      if (payload.algo_top_properties && Array.isArray(payload.algo_top_properties)) {
        processedRecommendedProperties = payload.algo_top_properties.map(prop => processPropertyImages(prop));
        setRecommendedProperties(processedRecommendedProperties);
      }

      // Preload first image of each property
      const allProperties = [
        ...(processedRequestedProperty ? [processedRequestedProperty] : []),
        ...processedRecommendedProperties
      ];

      await preloadFirstImages(allProperties);
      setImagesLoaded(true);

      setLoadingState({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setLoadingState({ isLoading: false, error: errorMessage });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loadingState.isLoading || !imagesLoaded) {
    return (
      <div className="app">
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
      <div className="app">
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

  if (!jsonPayload) {
    return (
      <div className="app">
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

  const isAccepted = isPropertyAccepted(jsonPayload.property_inquired_message);
  const showRecommendations = shouldShowRecommendations(jsonPayload.algo_message, jsonPayload.algo_top_properties);
  const statusMessage = getStatusMessage(jsonPayload.property_inquired_message, jsonPayload.algo_message, showRecommendations, isAccepted);
  const isPetFriendlyContext = jsonPayload.algo_message.includes('pets');

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-container">
          <img src="/logo_upscaled.png" alt="LTR Properties" className="logo-banner" />
        </div>
      </header>

      <main className="app-main">
        <section className="requested-property-section">
          <PersonalizedGreeting
            firstName={jsonPayload.first_name}
            statusMessage={statusMessage}
          />

          {requestedProperty && isAccepted && (
            <div className="requested-property-container">
              <PropertyCard
                property={requestedProperty}
                isGrayedOut={false}
                showBookButton={false}
                isPetFriendlyContext={isPetFriendlyContext}
                isRequestedProperty={true}
              />
            </div>
          )}

          <div className="signature-message">
            The Long Term Rental Team
          </div>
        </section>

        {showRecommendations && (
          <section className="recommended-properties-section">
            <div className="properties-grid">
              {recommendedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  showBookButton={true}
                  isPetFriendlyContext={isPetFriendlyContext}
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