import React from 'react';
import { FormData } from '../types';
import './FormContainer.css';

interface FormContainerProps {
  form: FormData;
  formIndex: number;
  onSelectInquiry: (formId: string, linkedInquiryId: string) => void;
}

const FORM_FIELD_LABELS: { key: keyof FormData; label: string }[] = [
  { key: "rental_duration", label: "Rental duration" },
  { key: "style", label: "Preferred style" },
  { key: "locations", label: "Prefered area(s)" },
  { key: "occupants", label: "Occupants" },
  { key: "bedrooms", label: "Bedrooms needed" },
  { key: "pets", label: "Pets?" },
  { key: "budget", label: "Preferred budget" }
];

const FormContainer: React.FC<FormContainerProps> = ({ form, formIndex, onSelectInquiry }) => {
  const getDisplayValue = (value: string | undefined): string => {
    if (!value || value.trim() === '') {
      return 'Not specified';
    }
    return value;
  };

  const handleSelectInquiry = () => {
    onSelectInquiry(form.form_id, form.linked_inquiry_id);
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h3 className="form-title">Inquiry #{formIndex + 1}</h3>
        <div className="form-title-underline"></div>
      </div>

      <div className="form-qa-section">
        {FORM_FIELD_LABELS.map((field) => {
          const value = form[field.key];
          // Only display fields that have values (not empty or undefined)
          if (value && value.trim() !== '') {
            return (
              <div key={field.key} className="qa-item">
                <div className="question">{field.label}</div>
                <div className="answer">{getDisplayValue(value)}</div>
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="form-actions">
        <button className="select-profile-button" onClick={handleSelectInquiry}>
          SELECT THIS INQUIRY
        </button>
      </div>
    </div>
  );
};

export default FormContainer;
