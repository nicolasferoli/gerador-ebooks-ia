'use client';

import React from 'react';
import { Check, Clock, FileText } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'default' | 'lg';
}

export function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    fontWeight: 'medium',
    padding: size === 'lg' ? '0.375rem 0.75rem' : '0.25rem 0.5rem',
    fontSize: size === 'lg' ? '0.875rem' : '0.75rem',
  };

  const getStyles = () => {
    if (status === 'completed' || status === 'Concluído') {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        color: '#15803d',
      };
    }
    
    if (status === 'generating_chapters' || status === 'generating_toc' || 
        status === 'generating_cover' || status === 'Em Progresso') {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        color: '#1d4ed8',
      };
    }
    
    // Default/Draft
    return {
      ...baseStyle,
      backgroundColor: 'rgba(107, 114, 128, 0.1)',
      color: '#4b5563',
    };
  };

  const iconStyle = {
    width: '0.875rem',
    height: '0.875rem',
    marginRight: '0.25rem',
  };

  const renderContent = () => {
    if (status === 'completed' || status === 'Concluído') {
      return (
        <>
          <Check style={iconStyle} />
          <span>Concluído</span>
        </>
      );
    }
    
    if (status === 'generating_chapters' || status === 'generating_toc' || 
        status === 'generating_cover' || status === 'Em Progresso') {
      return (
        <>
          <Clock style={{...iconStyle, animation: 'spin 2s linear infinite'}} />
          <span>Em Progresso</span>
        </>
      );
    }
    
    return (
      <>
        <FileText style={iconStyle} />
        <span>Rascunho</span>
      </>
    );
  };

  return (
    <span style={getStyles()}>
      {renderContent()}
    </span>
  );
} 