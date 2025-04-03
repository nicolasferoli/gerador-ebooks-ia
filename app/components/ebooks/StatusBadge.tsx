'use client';

import React from 'react';
import { Clock, Check, AlertCircle, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EbookStatus } from '../../types/ebook';

interface StatusBadgeProps {
  status: EbookStatus;
  progress?: number;
  className?: string;
}

export function StatusBadge({ status, progress = 0, className }: StatusBadgeProps) {
  // Determinar o estilo e o ícone com base no status
  const getBadgeStyles = () => {
    switch (status) {
      case 'completed':
        return {
          icon: <Check className="w-3 h-3 mr-1" />,
          text: "Concluído",
          className: "bg-green-100 text-green-800"
        };
      case 'failed':
        return {
          icon: <AlertCircle className="w-3 h-3 mr-1" />,
          text: "Falha",
          className: "bg-red-100 text-red-800"
        };
      case 'draft':
        return {
          icon: <FileText className="w-3 h-3 mr-1" />,
          text: "Rascunho",
          className: "bg-gray-100 text-gray-800"
        };
      case 'generating_toc':
      case 'generating_chapters':
      case 'generating_cover':
        return {
          icon: <Clock className="w-3 h-3 mr-1 animate-spin" />,
          text: status === 'generating_toc' 
            ? "Gerando sumário" 
            : status === 'generating_chapters' 
              ? `Gerando capítulos (${Math.round(progress)}%)` 
              : "Criando capa",
          className: "bg-purple-100 text-purple-800"
        };
      default:
        return {
          icon: <Clock className="w-3 h-3 mr-1" />,
          text: "Processando",
          className: "bg-gray-100 text-gray-800"
        };
    }
  };

  const { icon, text, className: statusClassName } = getBadgeStyles();

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center", 
      statusClassName,
      className
    )}>
      {icon}
      {text}
    </span>
  );
} 