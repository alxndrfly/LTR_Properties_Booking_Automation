import React from 'react';
import { Property } from '../types';
import ImageCarousel from './ImageCarousel';
import './PropertyCard.css';

interface PropertyCardProps {
  property: Property;
  isGrayedOut?: boolean;
  statusMessage?: string;
  showBookButton?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isGrayedOut = false,
  statusMessage,
  showBookButton = true
}) => {
  const formatPrice = (price: string) => {
    return `€${price}`;
  };

  const getLocationString = (locations: string[]) => {
    return locations.join(', ');
  };

  const getMatchPercentage = () => {
    return property.totalScore ? `${Math.round(property.totalScore)}% Match` : '95% Match';
  };

  const getAmenities = (): string[] => {
    const amenities: string[] = [];
    if (property["Property Features"]) {
      amenities.push(...property["Property Features"].slice(0, 4));
    }
    // Add some default amenities if not enough
    const defaultAmenities: string[] = ['Pool', 'Air conditioning', 'Pets allowed', 'Free cancellation'];
    while (amenities.length < 4) {
      const nextDefault: string | undefined = defaultAmenities[amenities.length];
      if (nextDefault && !amenities.includes(nextDefault)) {
        amenities.push(nextDefault);
      } else {
        break;
      }
    }
    return amenities.slice(0, 4);
  };

  return (
    <div className={`property-card ${isGrayedOut ? 'grayed-out' : ''}`}>
      <div className="property-image-section">
        <ImageCarousel
          images={property.images || []}
          alt={property.Nombre}
        />
      </div>

      <div className="property-details">
        <div className="property-header">
          <h3 className="property-name">{property.Nombre}</h3>
          <div className="match-percentage">{getMatchPercentage()}</div>
        </div>

        <div className="property-main-content">
          <div className="property-left-column">
            <div className="property-price-section">
              <div className="property-price">{formatPrice(property.Precio)}</div>
              <div className="property-price-period">Per Month</div>
              <div className="property-call-only">CALL ONLY</div>
            </div>

            <div className="property-location-section">
              <h4 className="section-title">Location</h4>
              <div className="property-location">{getLocationString(property.Location)}</div>
            </div>

            <div className="property-room-details">
              <div className="room-detail">
                <span className="room-icon">🛏️</span>
                <span>{property["Num Habitaciones"]} Bedrooms</span>
              </div>
              <div className="room-detail">
                <span className="room-icon">🚿</span>
                <span>{property["Num Baños"]} Bathrooms</span>
              </div>
              <div className="room-detail">
                <span className="room-icon">📐</span>
                <span>{property["Area (m²)"]} m²</span>
              </div>
            </div>
          </div>

          <div className="property-right-column">
            <div className="property-features-section">
              <h4 className="section-title">Features</h4>
              <div className="features-list">
                {getAmenities().map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-checkmark">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="property-description-section">
              <h4 className="section-title">Description</h4>
              <div className="property-description">
                {property.Description || 'Located within an exclusive, fully gated development on the hills close adjacent city offers privacy, comfort, and breathtaking sea views. Experience the ideal blend of security, luxury and convenience for the ideal Ibiza lifestyle.'}
              </div>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className={`status-message ${isGrayedOut ? 'error' : 'success'}`}>
            {statusMessage}
          </div>
        )}

        {showBookButton && (
          <button
            className="book-button"
            disabled={isGrayedOut}
            onClick={() => console.log(`Book visit for ${property.Nombre}`)}
          >
            BOOK NOW
          </button>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;