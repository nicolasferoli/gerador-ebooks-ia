'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookPlus, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface EmptyStateProps {
  title?: string;
  message?: string;
  ctaText?: string;
  ctaLink?: string;
  className?: string;
}

export function EmptyState({
  title = "Nenhum E-book encontrado",
  message = "Você ainda não tem nenhum e-book criado. Comece criando seu primeiro e-book com nosso assistente de IA.",
  ctaText = "Criar meu primeiro E-book",
  ctaLink = "/ebooks/new",
  className
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
    >
      <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
        <FileText className="h-10 w-10 text-purple-600 dark:text-purple-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        {message}
      </p>
      
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
        >
          <Link href={ctaLink} className="flex items-center">
            <BookPlus className="mr-2 h-4 w-4" />
            {ctaText}
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
} 