'use client';

import Link from 'next/link';
import { 
  Book, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ExternalLink, 
  ChevronRight, 
  Clock, 
  Check,
  Download,
  FileText
} from 'lucide-react';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EbookCardProps {
  ebook: Ebook;
  onDelete: (id: string) => void;
  featured?: boolean;
}

export function EbookCard({ ebook, onDelete, featured = false }: EbookCardProps) {
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

  const isGenerating = 
    ebook.status === 'generating_toc' || 
    ebook.status === 'generating_chapters' || 
    ebook.status === 'generating_cover';

  const formattedDate = format(
    new Date(ebook.createdAt), 
    'dd/MM/yyyy', 
    { locale: ptBR }
  );
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 } 
      }}
      className={featured ? 'relative z-10' : ''}
    >
      <div className={`
        overflow-hidden border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col
        ${featured ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-200'}
      `}>
        <div className="flex flex-col md:flex-row h-full">
          {/* Left side - Cover image or gradient */}
          <div className="w-full md:w-1/3 bg-gradient-to-br from-purple-400 to-purple-700 text-white relative">
            {/* Background pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                backgroundSize: '150px 150px'
              }}
            />
            
            <div className="flex items-center justify-center h-full p-6">
              {ebook.coverImageUrl ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="shadow-lg rounded-md overflow-hidden"
                >
                  <img
                    src={ebook.coverImageUrl}
                    alt={ebook.title}
                    className="h-40 w-32 object-cover"
                  />
                </motion.div>
              ) : (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="h-40 w-32 bg-white/10 backdrop-blur-sm rounded-md shadow-lg flex items-center justify-center"
                >
                  <Book className="h-12 w-12 text-white/70" />
                </motion.div>
              )}
            </div>
            
            {/* Progress bar overlay at bottom if generating */}
            {isGenerating && (
              <div className="absolute bottom-0 left-0 w-full">
                <Progress 
                  value={ebook.progress} 
                  className="h-1.5 rounded-none" 
                  indicatorClassName="bg-purple-300 animate-pulse"
                />
              </div>
            )}
          </div>
          
          {/* Right side - Content */}
          <div className="w-full md:w-2/3 p-5 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg line-clamp-2">{ebook.title}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                  <DropdownMenuItem className="cursor-pointer rounded-md flex items-center py-2">
                    <Download className="mr-2 h-4 w-4" />
                    <span>Baixar PDF</span>
                  </DropdownMenuItem>
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
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
              {ebook.description || 'Sem descrição'}
            </p>
            
            <div className="flex items-center space-x-3 mb-3 text-xs text-gray-500">
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1" />
                <span>{ebook.chapters.length} {ebook.chapters.length === 1 ? 'capítulo' : 'capítulos'}</span>
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="flex items-center justify-between">
                {ebook.status === 'completed' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Concluído
                  </span>
                ) : isGenerating ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center">
                    <Clock className="w-3 h-3 mr-1 animate-spin" /> Em Progresso
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center">
                    <FileText className="w-3 h-3 mr-1" /> Rascunho
                  </span>
                )}
              </div>
              
              {/* Barra de progresso para e-books em andamento */}
              {isGenerating && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Gerando conteúdo</span>
                    <span>{Math.round(ebook.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div 
                      className="bg-purple-600 h-2 rounded-full animate-pulse" 
                      style={{ width: `${ebook.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Botão principal conforme o estado */}
              {featured ? (
                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
                  asChild
                >
                  <Link href={`/ebooks/${ebook.id}/edit`}>
                    Continuar editando
                  </Link>
                </Button>
              ) : (
                <Button
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1 transition-all"
                  asChild
                >
                  <Link href={`/ebooks/${ebook.id}`}>
                    Abrir E-book
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 