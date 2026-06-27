import React from 'react';

export const Spinner: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => {
  return (
    <div
      className={`loader-spinner ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: '4px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 1s infinite linear',
      }}
    />
  );
};

export default Spinner;