import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 overflow-hidden animate-fade-in ${className}`}>
      {title && <h2 className="text-xl font-semibold text-primary-700 mb-4 text-center">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;