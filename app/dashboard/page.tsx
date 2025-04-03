'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, BookPlus, ChevronDown, Package, FilePlus2, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { EbookCard } from '../components/ebooks/EbookCard';
import { StatusBadge } from '../components/ebooks/StatusBadge';
import { ProgressBar } from '../components/ebooks/ProgressBar';
import { PromotionalBanner } from '../components/ebooks/PromotionalBanner';
import { FeaturedEbook } from '../components/ebooks/FeaturedEbook';
import { EmptyState } from '../components/ebooks/EmptyState';
import { Ebook, EbookStatus } from '../types/ebook';

// Demo data
const demoEbooks: Ebook[] = [
  {
    id: '1',
    title: 'Introdução ao React e TypeScript',
    description: 'Um guia abrangente para iniciantes em React e TypeScript. Aprenda sobre componentes, hooks, e tipagem estática.',
    coverImageUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    status: 'completed',
    createdAt: '2023-11-20T18:25:43.511Z',
    updatedAt: '2023-11-21T20:25:43.511Z',
    userId: 'user1',
    templateId: 'template1',
    progress: 100,
    tocGenerated: true,
    chapters: [
      { 
        id: '1', 
        ebookId: '1', 
        number: 1, 
        title: 'Introdução ao React', 
        content: 'Conteúdo do capítulo', 
        status: 'completed',
        createdAt: '2023-11-20T18:30:43.511Z',
        updatedAt: '2023-11-20T18:45:43.511Z'
      },
      { 
        id: '2', 
        ebookId: '1', 
        number: 2, 
        title: 'Componentes Funcionais', 
        content: 'Conteúdo do capítulo', 
        status: 'completed',
        createdAt: '2023-11-20T19:00:43.511Z',
        updatedAt: '2023-11-20T19:15:43.511Z'
      },
      { 
        id: '3', 
        ebookId: '1', 
        number: 3, 
        title: 'TypeScript Básico', 
        content: 'Conteúdo do capítulo', 
        status: 'completed',
        createdAt: '2023-11-20T19:30:43.511Z',
        updatedAt: '2023-11-20T19:45:43.511Z'
      }
    ]
  },
  {
    id: '2',
    title: 'Desenvolvimento de APIs RESTful com Node.js e Express',
    description: 'Aprenda a criar APIs modernas com Node.js e Express. Este livro cobre rotas, middlewares, autenticação e mais.',
    coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    status: 'generating_chapters',
    createdAt: '2023-11-17T15:30:43.511Z',
    updatedAt: '2023-11-19T08:30:43.511Z',
    userId: 'user1',
    templateId: 'template2',
    progress: 65,
    tocGenerated: true,
    chapters: [
      { 
        id: '4', 
        ebookId: '2', 
        number: 1, 
        title: 'Introdução ao Node.js', 
        content: 'Conteúdo do capítulo', 
        status: 'completed',
        createdAt: '2023-11-17T16:00:43.511Z',
        updatedAt: '2023-11-17T16:15:43.511Z'
      },
      { 
        id: '5', 
        ebookId: '2', 
        number: 2, 
        title: 'Express.js Básico', 
        content: 'Conteúdo do capítulo', 
        status: 'generating',
        createdAt: '2023-11-17T16:30:43.511Z',
        updatedAt: '2023-11-17T16:45:43.511Z'
      }
    ]
  },
  {
    id: '3',
    title: 'Fundamentos de Python para Ciência de Dados',
    description: 'Explore Python no contexto de ciência de dados. Aprenda numpy, pandas, matplotlib e técnicas básicas de análise.',
    coverImageUrl: null,
    status: 'draft',
    createdAt: '2023-11-15T10:15:43.511Z',
    updatedAt: '2023-11-15T12:30:43.511Z',
    userId: 'user1',
    templateId: 'template3',
    progress: 0,
    tocGenerated: false,
    chapters: [
      { 
        id: '6', 
        ebookId: '3', 
        number: 1, 
        title: 'Introdução à Python', 
        content: 'Conteúdo do capítulo', 
        status: 'pending',
        createdAt: '2023-11-15T10:45:43.511Z',
        updatedAt: '2023-11-15T11:00:43.511Z'
      }
    ]
  }
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulação de loading para propósitos de demonstração
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  const handleDeleteEbook = (id: string) => {
    console.log('Deleting ebook:', id);
    // Implementar a lógica de exclusão
  };

  // Filtragem e ordenação
  const filteredEbooks = React.useMemo(() => {
    let result = [...demoEbooks];
    
    // Filtragem por título ou descrição
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        ebook => 
          ebook.title.toLowerCase().includes(query) || 
          ebook.description.toLowerCase().includes(query)
      );
    }
    
    // Ordenação
    switch (sortBy) {
      case 'date':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'status':
        result.sort((a, b) => {
          // Ordem personalizada: em andamento > concluído > rascunho
          const statusOrder = {
            'generating_toc': 0,
            'generating_chapters': 0,
            'generating_cover': 0,
            'completed': 1,
            'draft': 2,
            'failed': 3
          };
          return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
        });
        break;
    }
    
    return result;
  }, [demoEbooks, searchQuery, sortBy]);
  
  // Pegar o e-book mais recente para o destaque
  const mostRecentEbook = React.useMemo(() => {
    if (demoEbooks.length === 0) return null;
    
    return [...demoEbooks].sort((a, b) => 
      new Date(b.updatedAt || b.createdAt).getTime() - 
      new Date(a.updatedAt || a.createdAt).getTime()
    )[0];
  }, [demoEbooks]);
  
  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Cabeçalho principal com botão de novo e-book */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Meus E-books
        </h1>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Button 
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white text-base py-2.5 px-4 shadow-md shadow-purple-200 dark:shadow-purple-900/20 flex items-center"
          >
            <Link href="/ebooks/new" className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Novo E-book
            </Link>
          </Button>
        </motion.div>
      </header>
      
      {/* Banner promocional */}
      <section className="mb-8">
        <PromotionalBanner />
      </section>
      
      {/* Estatísticas / Card de resumo */}
      <section className="mb-8">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Package className="mr-2 h-5 w-5 text-purple-500" />
              Estatísticas de E-books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Total de E-books</h3>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{demoEbooks.length}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Concluídos</h3>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {demoEbooks.filter(ebook => ebook.status === 'completed').length}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Em Andamento</h3>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {demoEbooks.filter(ebook => 
                    ebook.status === 'generating_toc' || 
                    ebook.status === 'generating_chapters' || 
                    ebook.status === 'generating_cover'
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* E-book em destaque (o mais recente) */}
      {mostRecentEbook && (
        <section className="mb-8">
          <FeaturedEbook ebook={mostRecentEbook} onDelete={handleDeleteEbook} />
        </section>
      )}
      
      {/* Lista de e-books */}
      <section className="mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-0">
            Todos os E-books
          </h2>
          
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Buscar e-books..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-gray-800"
              />
            </div>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full"
              >
                <option value="date">Mais recentes</option>
                <option value="title">Por título</option>
                <option value="status">Por status</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          // Estado de carregamento
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div 
                key={item} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg h-64 bg-gray-50 dark:bg-gray-800 animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredEbooks.length > 0 ? (
          // Grid de e-books quando há resultados
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEbooks.map((ebook) => (
              <EbookCard key={ebook.id} ebook={ebook} onDelete={handleDeleteEbook} />
            ))}
          </div>
        ) : (
          // Estado vazio quando não há resultados
          <EmptyState 
            title="Nenhum E-book encontrado" 
            message={searchQuery 
              ? "Não encontramos nenhum e-book correspondente aos seus critérios de busca. Tente outros termos." 
              : "Você ainda não tem nenhum e-book. Comece criando seu primeiro e-book com nosso assistente de IA."
            }
          />
        )}
      </section>
    </motion.div>
  );
} 