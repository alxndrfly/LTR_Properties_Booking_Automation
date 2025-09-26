import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="error-container">
      <div className="error-content">
        <h2 className="error-title">No recommendations found</h2>
        <p className="error-message">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;