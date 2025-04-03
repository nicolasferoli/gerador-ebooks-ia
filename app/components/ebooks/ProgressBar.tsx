'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export function ProgressBar({ progress, className = "" }: ProgressBarProps) {
  const containerStyle = {
    ...className && { marginTop: className.includes('mt-4') ? '1rem' : '' }
  };

  const labelContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    marginBottom: '0.25rem'
  };

  const labelStyle = {
    color: '#6b7280'
  };

  const valueStyle = {
    fontWeight: 'medium'
  };

  const trackStyle = {
    height: '0.375rem',
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    overflow: 'hidden'
  };

  const indicatorStyle = {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: '9999px',
    width: `${progress}%`
  };

  return (
    <div style={containerStyle}>
      <div style={labelContainerStyle}>
        <span style={labelStyle}>Progresso</span>
        <span style={valueStyle}>{progress}%</span>
      </div>
      <div style={trackStyle}>
        <div style={indicatorStyle} />
      </div>
    </div>
  );
} 