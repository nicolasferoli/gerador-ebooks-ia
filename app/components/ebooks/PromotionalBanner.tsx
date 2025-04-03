'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface PromotionalBannerProps {
  className?: string;
}

export function PromotionalBanner({ className }: PromotionalBannerProps) {
  const bannerStyle = {
    overflow: 'hidden',
    borderRadius: '0.5rem',
    background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
    color: 'white',
    marginBottom: '2rem'
  };

  const contentStyle = {
    padding: '1.5rem 2rem',
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    '@media (min-width: 768px)': {
      flexDirection: 'row' as const,
      alignItems: 'center'
    }
  };

  const textContainerStyle = {
    marginBottom: '1rem',
    '@media (min-width: 768px)': {
      marginBottom: '0'
    }
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'medium',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center'
  };

  const descriptionStyle = {
    color: 'rgba(237, 233, 254, 0.9)',
    maxWidth: '32rem'
  };

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'white',
    color: '#6d28d9',
    borderRadius: '0.375rem',
    fontWeight: 'medium',
    whiteSpace: 'nowrap' as const,
    textDecoration: 'none',
    transition: 'all 0.2s',
    border: 'none',
    cursor: 'pointer'
  };

  const buttonHoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transform: 'translateY(-1px)'
  };

  const iconStyle = {
    width: '1.5rem',
    height: '1.5rem',
    marginRight: '0.5rem'
  };

  return (
    <div style={bannerStyle}>
      <div style={contentStyle}>
        <div style={containerStyle} className="flex flex-col md:flex-row justify-between items-center">
          <div style={textContainerStyle} className="mb-4 md:mb-0">
            <h2 style={titleStyle}>
              <Sparkles style={iconStyle} />
              Crie seu E-book com IA
            </h2>
            <p style={descriptionStyle}>
              Gere um livro completo em minutos com nossa tecnologia de inteligência artificial.
            </p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/ebooks/new" passHref>
              <span style={buttonStyle}>
                Criar um novo E-book
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 