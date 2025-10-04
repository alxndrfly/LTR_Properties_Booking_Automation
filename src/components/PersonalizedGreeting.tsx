import React, { ReactNode } from 'react';
import './PersonalizedGreeting.css';

interface PersonalizedGreetingProps {
  firstName?: string;
  statusMessage: string | ReactNode;
}

const PersonalizedGreeting: React.FC<PersonalizedGreetingProps> = ({
  firstName,
  statusMessage
}) => {
  const getGreeting = () => {
    return firstName ? `Dear ${firstName}` : 'Dear Customer';
  };

  return (
    <div className="personalized-greeting">
      <div className="greeting-line">
        <span className="greeting-dear">{getGreeting()},</span>
      </div>
      <div className="greeting-message">
        {statusMessage}
      </div>
    </div>
  );
};

export default PersonalizedGreeting;