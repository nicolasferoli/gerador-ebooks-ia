'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Calendar,
  BookOpen,
  Eye,
  Pencil,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Ebook {
  id: string;
  title: string;
  description?: string;
  status: string;
  progress?: number;
  createdAt: string;
  chapters: any[];
}

interface EbookCardProps {
  ebook: Ebook;
  onDelete?: (id: string) => void;
}

export function EbookCard({ ebook, onDelete }: EbookCardProps) {
  const formattedDate = format(
    new Date(ebook.createdAt),
    'dd/MM/yyyy',
    { locale: ptBR }
  );

  // Container styles
  const cardStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const
  };

  const cardHoverStyle = {
    borderColor: '#a78bfa',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  // Content styles
  const contentStyle = {
    padding: '1.25rem',
    flex: '1',
    display: 'flex',
    flexDirection: 'column' as const
  };

  // Header styles
  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem'
  };

  const titleContainerStyle = {
    display: 'flex',
    alignItems: 'center'
  };

  const iconContainerStyle = {
    width: '2rem',
    height: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '9999px',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    color: '#7c3aed',
    marginRight: '0.75rem'
  };

  const titleStyle = {
    fontWeight: 'medium',
    fontSize: '1.125rem',
    lineHeight: '1.5rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const
  };

  // Description styles
  const descriptionStyle = {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  // Metadata styles
  const metadataStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#6b7280'
  };

  const metaItemStyle = {
    display: 'flex',
    alignItems: 'center'
  };

  const metaIconStyle = {
    width: '0.875rem',
    height: '0.875rem',
    marginRight: '0.25rem'
  };

  // Separator
  const separatorStyle = {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '1rem 0'
  };

  // Actions
  const actionsStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem'
  };

  const buttonBaseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    cursor: 'pointer'
  };

  const ghostButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: 'transparent',
    color: '#6b7280'
  };

  const outlineButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    color: '#374151'
  };

  const primaryButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#7c3aed',
    color: 'white'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ ...cardHoverStyle, y: -5 }}
    >
      <div style={cardStyle}>
        <div style={contentStyle}>
          {/* Header with title and status */}
          <div style={headerStyle}>
            <div style={titleContainerStyle}>
              <div style={iconContainerStyle}>
                <FileText size={16} />
              </div>
              <h3 style={titleStyle}>{ebook.title}</h3>
            </div>
            <StatusBadge status={ebook.status} />
          </div>

          {/* Description */}
          <p style={descriptionStyle}>
            {ebook.description || 'Sem descrição'}
          </p>

          {/* Metadata */}
          <div style={metadataStyle}>
            <div style={metaItemStyle}>
              <Calendar style={metaIconStyle} />
              <span>{formattedDate}</span>
            </div>
            <div style={metaItemStyle}>
              <BookOpen style={metaIconStyle} />
              <span>{ebook.chapters.length} capítulos</span>
            </div>
          </div>

          {/* Progress bar for in-progress ebooks */}
          {(ebook.status === 'generating_chapters' || 
            ebook.status === 'Em Progresso') && (
            <ProgressBar 
              progress={ebook.progress || 45} 
              className="mt-4" 
            />
          )}

          {/* Separator */}
          <div style={separatorStyle} />

          {/* Actions */}
          <div style={actionsStyle}>
            <Link href={`/ebooks/${ebook.id}`} style={{ textDecoration: 'none' }}>
              <button style={ghostButtonStyle}>
                <Eye size={16} style={{ marginRight: '0.25rem' }} />
                Visualizar
              </button>
            </Link>
            <Link href={`/ebooks/${ebook.id}/edit`} style={{ textDecoration: 'none' }}>
              <button style={outlineButtonStyle}>
                <Pencil size={16} style={{ marginRight: '0.25rem' }} />
                Editar
              </button>
            </Link>
            <Link href={`/ebooks/${ebook.id}`} style={{ textDecoration: 'none' }}>
              <button style={primaryButtonStyle}>
                Abrir
              </button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 