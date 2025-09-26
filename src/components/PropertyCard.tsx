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
    return `€${price}/month`;
  };

  const getLocationString = (locations: string[]) => {
    return locations.join(', ');
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
        <div className="property-content">
          <h3 className="property-name">{property.Nombre}</h3>

          <div className="property-info">
            <div className="property-price">{formatPrice(property.Precio)}</div>
            <div className="property-specs">
              <span>{property["Num Habitaciones"]} bed{property["Num Habitaciones"] !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>{property["Num Baños"]} bath{property["Num Baños"] !== 1 ? 's' : ''}</span>
            </div>
            <div className="property-location">{getLocationString(property.Location)}</div>
          </div>
        </div>

        <div className="property-actions">
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
              Book a visit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;