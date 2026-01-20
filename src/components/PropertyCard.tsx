import React from 'react';
import { Property } from '../types';
import ImageCarousel from './ImageCarousel';
import './PropertyCard.css';

interface PropertyCardProps {
  property: Property;
  isGrayedOut?: boolean;
  statusMessage?: string;
  showBookButton?: boolean;
  isPetFriendlyContext?: boolean;
  isRequestedProperty?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isGrayedOut = false,
  statusMessage,
  showBookButton = true,
  isPetFriendlyContext = false,
  isRequestedProperty = false
}) => {
  const formatPrice = (price: string) => {
    return `€${price}`;
  };

  const getLocationString = (locations: string[]) => {
    return locations ? locations.join(', ') : 'Location not specified';
  };

  const getMatchPercentage = () => {
    if (property.totalScore !== undefined) {
      return `${Math.round(property.totalScore * 100)}% Match`;
    }
    return '95% Match';
  };

  const getFeatures = (): { text: string; isBold: boolean }[] => {
    let features: string[] = [];
    if (property["Property Features"]) {
      features = property["Property Features"];
    } else {
      features = ['Pool', 'Air conditioning', 'Pets allowed', 'Free cancellation'];
    }

    const isPetContext = isPetFriendlyContext || property.petFriendly;

    if (!isPetContext) {
      return features.map(feature => ({ text: feature, isBold: false }));
    }

    // Find pet-related features
    const petFeatures: string[] = [];
    const otherFeatures: string[] = [];

    features.forEach(feature => {
      const featureLower = feature.toLowerCase();
      if (featureLower.includes('pet') || featureLower.includes('animal')) {
        petFeatures.push(feature);
      } else {
        otherFeatures.push(feature);
      }
    });

    // Combine with pet features first (bold) and others after (normal)
    return [
      ...petFeatures.map(feature => ({ text: feature, isBold: true })),
      ...otherFeatures.map(feature => ({ text: feature, isBold: false }))
    ];
  };

  const getStatusText = (): string => {
    const status = property["Seasonal / Annual"];
    if (status) {
      return `${status.toUpperCase()} RENTAL`;
    }
    return 'CALA MOLÍ — ANNUAL RENTAL';
  };

  const hasGarage = (): boolean => {
    const garageCount = property["Num Plazas Garage"];
    return typeof garageCount === 'number' && garageCount > 0;
  };

  const formatDescription = (description: string): JSX.Element => {
    if (!description) return <></>;

    // Split by sentence endings and clean up
    const sentences = description
      .split(/([.!?]+)/)
      .reduce((acc: string[], curr: string, index: number, array: string[]) => {
        if (index % 2 === 0) {
          // Text part
          const nextPunctuation = array[index + 1] || '';
          if (curr.trim()) {
            acc.push(curr.trim() + nextPunctuation);
          }
        }
        return acc;
      }, [])
      .filter(sentence => sentence.trim().length > 0);

    // Create JSX with line breaks after sentences ending with dots
    return (
      <>
        {sentences.map((sentence, index) => (
          <span key={index}>
            {sentence}
            {sentence.endsWith('.') && index < sentences.length - 1 && (
              <>
                <br />
                <br />
              </>
            )}
            {!sentence.endsWith('.') && index < sentences.length - 1 && '  '}
          </span>
        ))}
      </>
    );
  };

  const handleBookViewing = () => {
    const propertyName = encodeURIComponent(property.Nombre);
    const location = encodeURIComponent(getLocationString(property.Location));
    window.location.href = `/booking?property=${propertyName}&location=${location}`;
  };

  return (
    <>
      <div className={`property-card ${isGrayedOut ? 'grayed-out' : ''}`}>
        {/* Top Section: Title and Match Score */}
        <div className="property-header">
          <div className="property-title-section">
            <h3 className="property-title">{property.Nombre}</h3>
            <div className="title-underline"></div>
          </div>
          {!isRequestedProperty && (
            <div className="match-score-section">
              <div className="match-percentage">{getMatchPercentage()}</div>
              <div className="score-underline"></div>
            </div>
          )}
          {isRequestedProperty && isGrayedOut && (
            <div className="match-score-section">
              <div className="match-percentage">Mismatch</div>
              <div className="score-underline"></div>
            </div>
          )}
        </div>

        {/* Image Carousel Section */}
        <div className="property-image-container">
          <ImageCarousel
            images={property.images || []}
            alt={property.Nombre}
            hideControls={isGrayedOut}
            firstImageDimensions={property.firstImageDimensions}
          />
          {isGrayedOut && statusMessage && (
            <div className="unavailable-overlay">
              <div className="unavailable-message">{statusMessage}</div>
            </div>
          )}
        </div>

        {/* Three Column Bottom Section */}
        {!isGrayedOut && (
          <div className="property-content">
          {/* Left Column */}
          <div className="property-left-column">
            <div className="property-status">{getStatusText()}</div>

            <div className="price-location-row">
              <div className="price-section">
                <div className="property-price">{formatPrice(property.Precio)}</div>
                <div className="property-period">Per Month</div>
              </div>

              <div className="location-section">
                <div className="located-in-label">Located in</div>
                <div className="location-value">{getLocationString(property.Location)}</div>
              </div>
            </div>

            <div className="property-specs">
              <div className="spec-row">
                <div className="spec-item">
                  <span className="spec-title">Bedrooms</span>
                  <div className="spec-content">
                    <span className="spec-icon bedroom-icon">🛏</span>
                    <span className="spec-number">{property["Num Habitaciones"]}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <span className="spec-title">Bathrooms</span>
                  <div className="spec-content">
                    <span className="spec-icon">🚿</span>
                    <span className="spec-number">{property["Num Baños"]}</span>
                  </div>
                </div>
              </div>
              <div className="spec-row">
                {hasGarage() && (
                  <div className="spec-item">
                    <span className="spec-title">Garage</span>
                    <div className="spec-content">
                      <span className="spec-icon">🚗</span>
                      <span className="spec-number">{property["Num Plazas Garage"]}</span>
                    </div>
                  </div>
                )}
                <div className="spec-item">
                  <span className="spec-title">Area</span>
                  <div className="spec-content">
                    <span className="spec-icon area-icon">📐</span>
                    <span className="spec-number">{property["Area (m²)"]} m²</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Center Column */}
          <div className="property-center-column">
            <h4 className="column-title">Features</h4>
            <div className="features-container">
              {getFeatures().map((feature, index) => (
                <div key={index} className="feature-item">
                  <span className="feature-checkmark">✓</span>
                  <span className={`feature-text ${feature.isBold ? 'feature-text-bold' : ''}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="property-right-column">
            <h4 className="column-title">Description</h4>
            <div className="description-container">
              <div className="description-text">
                {formatDescription(property.Description || 'Located within an exclusive, fully gated development on the hills close adjacent city offers privacy, comfort, and breathtaking sea views. Experience the ideal blend of security, luxury and convenience for the ideal Ibiza lifestyle.')}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Centered Book Viewing Button */}
        {showBookButton && !isGrayedOut && (
          <div className="book-viewing-container">
            <button
              className="book-viewing-button"
              disabled={isGrayedOut}
              onClick={handleBookViewing}
            >
              BOOK VIEWING
            </button>
          </div>
        )}

        {statusMessage && !isGrayedOut && (
          <div className={`status-message ${isGrayedOut ? 'error' : 'success'}`}>
            {statusMessage}
          </div>
        )}
      </div>

    </>
  );
};

export default PropertyCard;