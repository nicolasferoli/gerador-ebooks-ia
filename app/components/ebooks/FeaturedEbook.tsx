'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Ebook } from '../../types/ebook';
import { ChevronRight, Clock, Star } from 'lucide-react';
import { EbookCard } from './EbookCard';

interface FeaturedEbookProps {
  ebook: Ebook;
  onDelete: (id: string) => void;
  className?: string;
}

export function FeaturedEbook({ ebook, onDelete, className }: FeaturedEbookProps) {
  if (!ebook) {
    return null;
  }
  
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center mb-4">
        <Star className="w-5 h-5 text-yellow-500 mr-2" />
        <h2 className="text-lg font-medium">Ebook Recente</h2>
        <motion.div 
          className="ml-auto text-xs text-gray-500 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Clock className="w-3.5 h-3.5 mr-1" />
          Atualizado {formatTimeAgo(new Date(ebook.updatedAt || ebook.createdAt))}
        </motion.div>
      </div>
      
      <EbookCard ebook={ebook} onDelete={onDelete} featured={true} />
    </div>
  );
}

// Função auxiliar para formatação de "há quanto tempo"
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'agora mesmo';
  } else if (diffMinutes < 60) {
    return `há ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffHours < 24) {
    return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffDays < 30) {
    return `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
} 