'use client';

import Link from 'next/link';
import { Book, MoreHorizontal, Edit, Trash2, ExternalLink, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Ebook } from '../../types/ebook';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Badge } from '../../components/ui/badge';

interface EbookCardProps {
  ebook: Ebook;
  onDelete: (id: string) => void;
}

export function EbookCard({ ebook, onDelete }: EbookCardProps) {
  const getStatusText = (status: string, progress: number) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'generating_toc':
        return 'Gerando sumário...';
      case 'generating_chapters':
        return `Gerando capítulos (${Math.round(progress)}%)`;
      case 'generating_cover':
        return 'Criando capa...';
      case 'completed':
        return 'Concluído';
      case 'failed':
        return 'Falha na geração';
      default:
        return 'Processando...';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'generating_toc':
      case 'generating_chapters':
      case 'generating_cover':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getProgressIndicatorColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 } 
      }}
    >
      <div className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col rounded-lg">
        <div className="p-0">
          <div className="relative h-36 bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
            {/* Background pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                backgroundSize: '150px 150px'
              }}
            />
            
            {/* Content */}
            <div className="p-6 relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <motion.h3 
                  className="text-xl font-bold truncate" 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {ebook.title}
                </motion.h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0">
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">Opções</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-1">
                    <Link href={`/ebooks/${ebook.id}`} passHref>
                      <DropdownMenuItem className="cursor-pointer rounded-md flex items-center py-2">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <span>Ver detalhes</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href={`/ebooks/${ebook.id}/edit`} passHref>
                      <DropdownMenuItem className="cursor-pointer rounded-md flex items-center py-2">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem 
                      onClick={() => onDelete(ebook.id)}
                      className="cursor-pointer rounded-md flex items-center py-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <Badge className={`mt-2 font-medium ${getStatusColor(ebook.status)}`}>
                {getStatusText(ebook.status, ebook.progress)}
              </Badge>
            </div>
            
            {/* Progress bar overlay at bottom if generating */}
            {(ebook.status === 'generating_toc' ||
              ebook.status === 'generating_chapters' ||
              ebook.status === 'generating_cover') && (
              <div className="absolute bottom-0 left-0 w-full">
                <Progress 
                  value={ebook.progress} 
                  className="h-1.5 rounded-none" 
                  indicatorClassName={getProgressIndicatorColor(ebook.status)}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-grow p-6">
          <div className="flex items-start gap-4">
            {ebook.coverImageUrl ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="shadow-md rounded-md overflow-hidden"
              >
                <img
                  src={ebook.coverImageUrl}
                  alt={ebook.title}
                  className="h-32 w-24 object-cover"
                />
              </motion.div>
            ) : (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="h-32 w-24 bg-gradient-to-b from-gray-100 to-gray-200 rounded-md shadow-sm flex items-center justify-center"
              >
                <Book className="h-10 w-10 text-gray-400" />
              </motion.div>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {new Date(ebook.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
              
              <p className="line-clamp-3 text-sm mb-3 text-gray-700">{ebook.description}</p>
              
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  {ebook.chapters.length} {ebook.chapters.length === 1 ? 'capítulo' : 'capítulos'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t">
          <Link href={`/ebooks/${ebook.id}`} className="w-full">
            <Button 
              variant="default" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 transition-all duration-300 group"
            >
              Abrir E-book
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
} 