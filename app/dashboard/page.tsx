'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Plus, FileText } from 'lucide-react';
import { EbookCard } from '../components/ebooks/EbookCard';
import { PromotionalBanner } from '../components/ebooks/PromotionalBanner';

type EbookStatus = 'draft' | 'generating_toc' | 'generating_chapters' | 'generating_cover' | 'completed' | 'failed';

interface Chapter {
  id: string;
  ebookId: string;
  number: number;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Ebook {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  status: EbookStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  templateId: string;
  progress: number;
  tocGenerated: boolean;
  chapters: Chapter[];
}

// Demo data
const demoEbooks: Ebook[] = [
  {
    id: '1',
    title: 'Introdução ao React e TypeScript',
    description: 'Um guia abrangente para iniciantes em React e TypeScript. Aprenda sobre componentes, hooks, e tipagem estática.',
    coverImageUrl: null,
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
    coverImageUrl: null,
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
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
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

  // Estilos
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  };

  const headerStyle = {
    marginBottom: '2rem'
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.5rem'
  };

  const subtitleStyle = {
    fontSize: '1rem',
    color: '#6b7280'
  };

  const sectionTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1rem'
  };

  const searchContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  };

  const inputContainerStyle = {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '20rem'
  };

  const searchIconStyle = {
    position: 'absolute' as const,
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    width: '1rem',
    height: '1rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    outline: 'none'
  };

  const selectStyle = {
    padding: '0.625rem 0.75rem',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    marginLeft: '0.5rem',
    outline: 'none',
    cursor: 'pointer'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: '1.5rem',
    '@media (min-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: 'repeat(3, 1fr)'
    }
  };

  const loadingContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem',
    height: '50vh'
  };

  const spinnerStyle = {
    width: '2rem',
    height: '2rem',
    border: '3px solid rgba(124, 58, 237, 0.1)',
    borderRadius: '50%',
    borderTop: '3px solid #7c3aed',
    animation: 'spin 1s linear infinite'
  };

  return (
    <div style={containerStyle}>
      {/* Cabeçalho */}
      <header style={headerStyle}>
        <h1 style={titleStyle}>Painel de E-books</h1>
        <p style={subtitleStyle}>Gerencie seus e-books e crie novos conteúdos</p>
      </header>

      {/* Banner promocional */}
      <PromotionalBanner />

      {/* Barra de pesquisa e filtros */}
      <div style={searchContainerStyle}>
        <h2 style={sectionTitleStyle}>Todos os E-books</h2>
        <div style={{ display: 'flex' }}>
          <div style={inputContainerStyle}>
            <Search style={searchIconStyle} />
            <input
              type="text"
              placeholder="Buscar e-books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={inputStyle}
            />
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={selectStyle}
          >
            <option value="date">Mais recentes</option>
            <option value="title">Título</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Lista de e-books */}
      {isLoading ? (
        <div style={loadingContainerStyle}>
          <div style={spinnerStyle} />
        </div>
      ) : filteredEbooks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ 
            width: '4rem', 
            height: '4rem', 
            margin: '0 auto', 
            marginBottom: '1rem',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText style={{ color: '#7c3aed', width: '2rem', height: '2rem' }} />
          </div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '500',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Nenhum e-book encontrado
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Comece criando seu primeiro e-book com nossa inteligência artificial
          </p>
          <Link href="/ebooks/new" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#7c3aed',
              color: 'white',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Criar E-book
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEbooks.map(ebook => (
            <EbookCard
              key={ebook.id}
              ebook={ebook}
              onDelete={handleDeleteEbook}
            />
          ))}
        </div>
      )}
    </div>
  );
} 