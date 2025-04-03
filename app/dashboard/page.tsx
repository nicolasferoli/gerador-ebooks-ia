'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, BookPlus, ChevronDown, Package, FilePlus2, Star, Clock, Check, FileText } from 'lucide-react';
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

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  };
  
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  };
  
  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937'
  };
  
  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    color: 'white',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    fontWeight: 'medium'
  };
  
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };
  
  const bannerStyle = {
    ...cardStyle,
    background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2rem 1.5rem'
  };
  
  const sectionTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: 'semibold',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center'
  };
  
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  };
  
  const ebookCardStyle = {
    ...cardStyle,
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%'
  };
  
  const searchInputStyle = {
    padding: '0.5rem 0.75rem',
    paddingLeft: '2.5rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    backgroundColor: 'white',
    width: '100%'
  };
  
  const searchContainerStyle = {
    position: 'relative' as const
  };
  
  return (
    <div style={containerStyle}>
      {/* Cabeçalho principal com botão de novo e-book */}
      <header style={headerStyle}>
        <h1 style={titleStyle}>
          Meus E-books
        </h1>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Link href="/ebooks/new" style={buttonStyle}>
            <Plus style={{marginRight: '0.5rem'}} size={18} />
            Novo E-book
          </Link>
        </motion.div>
      </header>
      
      {/* Banner promocional */}
      <section style={bannerStyle}>
        <div>
          <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
            <Star style={{display: 'inline', marginRight: '0.5rem'}} size={18} />
            Crie seu E-book com IA
          </h2>
          <p style={{maxWidth: '400px'}}>
            Gere um livro completo em minutos com nossa tecnologia de inteligência artificial.
          </p>
        </div>
        
        <Link href="/ebooks/new" style={{
          backgroundColor: 'white',
          color: '#7c3aed',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center'
        }}>
          Criar um novo E-book
          <ChevronDown style={{marginLeft: '0.25rem', transform: 'rotate(-90deg)'}} size={16} />
        </Link>
      </section>
      
      {/* Estatísticas / Card de resumo */}
      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>
          <Package style={{marginRight: '0.5rem'}} size={18} color="#7c3aed" />
          Estatísticas de E-books
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            backgroundColor: '#f3e8ff',
            borderRadius: '0.5rem'
          }}>
            <h3 style={{fontSize: '0.875rem', fontWeight: 'medium', color: '#7c3aed', marginBottom: '0.25rem'}}>
              Total de E-books
            </h3>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#6d28d9'}}>
              {demoEbooks.length}
            </p>
          </div>
          
          <div style={{
            padding: '1rem',
            backgroundColor: '#dcfce7',
            borderRadius: '0.5rem'
          }}>
            <h3 style={{fontSize: '0.875rem', fontWeight: 'medium', color: '#16a34a', marginBottom: '0.25rem'}}>
              Concluídos
            </h3>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d'}}>
              {demoEbooks.filter(ebook => ebook.status === 'completed').length}
            </p>
          </div>
          
          <div style={{
            padding: '1rem',
            backgroundColor: '#dbeafe',
            borderRadius: '0.5rem'
          }}>
            <h3 style={{fontSize: '0.875rem', fontWeight: 'medium', color: '#2563eb', marginBottom: '0.25rem'}}>
              Em Andamento
            </h3>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1d4ed8'}}>
              {demoEbooks.filter(ebook => 
                ebook.status === 'generating_toc' || 
                ebook.status === 'generating_chapters' || 
                ebook.status === 'generating_cover'
              ).length}
            </p>
          </div>
        </div>
      </section>
      
      {/* E-book em destaque (o mais recente) */}
      {mostRecentEbook && (
        <section style={{marginBottom: '1.5rem'}}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
            <h2 style={sectionTitleStyle}>
              <Star style={{marginRight: '0.5rem'}} size={18} color="#f59e0b" />
              Ebook Recente
            </h2>
            <div style={{marginLeft: 'auto', fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center'}}>
              <Clock style={{marginRight: '0.25rem'}} size={14} />
              Atualizado há 16 meses
            </div>
          </div>
          
          <div style={{
            ...ebookCardStyle,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #c4b5fd',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              height: '100%'
            }}>
              {/* Left side - Cover image or gradient */}
              <div style={{
                width: '33%',
                background: 'linear-gradient(to bottom right, #a855f7, #7c3aed)',
                color: 'white',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1.5rem'
              }}>
                {mostRecentEbook.coverImageUrl ? (
                  <img
                    src={mostRecentEbook.coverImageUrl}
                    alt={mostRecentEbook.title}
                    style={{
                      height: '10rem',
                      width: '8rem',
                      objectFit: 'cover',
                      borderRadius: '0.375rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                ) : (
                  <div style={{
                    height: '10rem',
                    width: '8rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <BookPlus style={{height: '3rem', width: '3rem', color: 'rgba(255, 255, 255, 0.7)'}} />
                  </div>
                )}
              </div>
              
              {/* Right side - Content */}
              <div style={{
                width: '67%',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{
                    fontWeight: 'semibold',
                    fontSize: '1.25rem',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2
                  }}>
                    {mostRecentEbook.title}
                  </h3>
                </div>
                
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.75rem',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2
                }}>
                  {mostRecentEbook.description || 'Sem descrição'}
                </p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <Clock style={{width: '0.875rem', height: '0.875rem', marginRight: '0.25rem'}} />
                    <span>{new Date(mostRecentEbook.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <FileText style={{width: '0.875rem', height: '0.875rem', marginRight: '0.25rem'}} />
                    <span>{mostRecentEbook.chapters.length} {mostRecentEbook.chapters.length === 1 ? 'capítulo' : 'capítulos'}</span>
                  </div>
                </div>
                
                <div style={{marginTop: 'auto'}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    {mostRecentEbook.status === 'completed' ? (
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 'medium',
                        backgroundColor: '#dcfce7',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <Check style={{width: '0.75rem', height: '0.75rem', marginRight: '0.25rem'}} />
                        Concluído
                      </span>
                    ) : ['generating_toc', 'generating_chapters', 'generating_cover'].includes(mostRecentEbook.status) ? (
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 'medium',
                        backgroundColor: '#f3e8ff',
                        color: '#7c3aed',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <Clock style={{width: '0.75rem', height: '0.75rem', marginRight: '0.25rem'}} />
                        Em Progresso
                      </span>
                    ) : (
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 'medium',
                        backgroundColor: '#f3f4f6',
                        color: '#4b5563',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <FileText style={{width: '0.75rem', height: '0.75rem', marginRight: '0.25rem'}} />
                        Rascunho
                      </span>
                    )}
                  </div>
                  
                  <button style={{
                    width: '100%',
                    marginTop: '1rem',
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    padding: '0.5rem 0.75rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem'
                  }}>
                    <Link href={`/ebooks/${mostRecentEbook.id}/edit`} style={{color: 'white', textDecoration: 'none'}}>
                      Continuar editando
                    </Link>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Lista de e-books */}
      <section style={{marginBottom: '1rem'}}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.5rem',
          '@media (min-width: 640px)': {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }
        }}>
          <h2 style={sectionTitleStyle}>
            Todos os E-books
          </h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            width: '100%',
            '@media (min-width: 640px)': {
              flexDirection: 'row',
              width: 'auto'
            }
          }}>
            <div style={searchContainerStyle}>
              <Search style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                width: '1rem',
                height: '1rem'
              }} />
              <input 
                type="text" 
                placeholder="Buscar e-books..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={searchInputStyle}
              />
            </div>
            
            <div style={{ position: 'relative' as const }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  appearance: 'none',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                  padding: '0.5rem 0.75rem',
                  paddingRight: '2rem',
                  borderRadius: '0.375rem',
                  width: '100%'
                }}
              >
                <option value="date">Mais recentes</option>
                <option value="title">Por título</option>
                <option value="status">Por status</option>
              </select>
              <ChevronDown style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                width: '1rem',
                height: '1rem',
                pointerEvents: 'none'
              }} />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          // Estado de carregamento
          <div style={gridStyle}>
            {[1, 2, 3].map((item) => (
              <div 
                key={item} 
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  height: '16rem',
                  backgroundColor: '#f9fafb',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              ></div>
            ))}
          </div>
        ) : filteredEbooks.length > 0 ? (
          // Grid de e-books quando há resultados
          <div style={gridStyle}>
            {filteredEbooks.map((ebook) => (
              <div key={ebook.id} style={ebookCardStyle}>
                <div style={{
                  height: '9rem',
                  background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
                  color: 'white',
                  position: 'relative',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 1
                    }}>
                      {ebook.title}
                    </h3>
                  </div>
                  
                  {ebook.status === 'completed' ? (
                    <span style={{
                      alignSelf: 'flex-start',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 'medium',
                      backgroundColor: 'rgba(220, 252, 231, 0.2)',
                      color: 'white'
                    }}>
                      Concluído
                    </span>
                  ) : ['generating_toc', 'generating_chapters', 'generating_cover'].includes(ebook.status) ? (
                    <span style={{
                      alignSelf: 'flex-start',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 'medium',
                      backgroundColor: 'rgba(243, 232, 255, 0.2)',
                      color: 'white'
                    }}>
                      Em Progresso
                    </span>
                  ) : (
                    <span style={{
                      alignSelf: 'flex-start',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 'medium',
                      backgroundColor: 'rgba(243, 244, 246, 0.2)',
                      color: 'white'
                    }}>
                      Rascunho
                    </span>
                  )}
                </div>
                
                <div style={{
                  flex: '1',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem'
                  }}>
                    {ebook.coverImageUrl ? (
                      <img
                        src={ebook.coverImageUrl}
                        alt={ebook.title}
                        style={{
                          height: '8rem',
                          width: '6rem',
                          objectFit: 'cover',
                          borderRadius: '0.375rem',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    ) : (
                      <div style={{
                        height: '8rem',
                        width: '6rem',
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.375rem',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}>
                        <BookPlus style={{height: '2.5rem', width: '2.5rem', color: '#9ca3af'}} />
                      </div>
                    )}
                    
                    <div style={{ flex: '1' }}>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <Clock style={{width: '1rem', height: '1rem', marginRight: '0.25rem'}} />
                        {new Date(ebook.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      
                      <p style={{
                        fontSize: '0.875rem',
                        marginBottom: '0.75rem',
                        color: '#4b5563',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3
                      }}>
                        {ebook.description}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: 'medium',
                          color: '#4b5563',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <FileText style={{width: '1rem', height: '1rem', marginRight: '0.25rem'}} />
                          {ebook.chapters.length} {ebook.chapters.length === 1 ? 'capítulo' : 'capítulos'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{
                  padding: '1rem 1.5rem',
                  backgroundColor: '#f9fafb',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <Link href={`/ebooks/${ebook.id}`} style={{
                    width: '100%',
                    display: 'inline-block',
                    textAlign: 'center' as const
                  }}>
                    <button style={{
                      width: '100%',
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      padding: '0.5rem 0.75rem',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: 'medium'
                    }}>
                      Abrir E-book
                      <ChevronDown style={{
                        width: '1rem',
                        height: '1rem',
                        transform: 'rotate(-90deg)'
                      }} />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Estado vazio quando não há resultados
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2.5rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              width: '5rem',
              height: '5rem',
              backgroundColor: '#f3e8ff',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <FileText style={{height: '2.5rem', width: '2.5rem', color: '#7c3aed'}} />
            </div>
            
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 'medium',
              color: '#111827',
              marginBottom: '0.5rem'
            }}>
              Nenhum E-book encontrado
            </h3>
            
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '1.5rem',
              maxWidth: '24rem'
            }}>
              {searchQuery 
                ? "Não encontramos nenhum e-book correspondente aos seus critérios de busca. Tente outros termos." 
                : "Você ainda não tem nenhum e-book. Comece criando seu primeiro e-book com nosso assistente de IA."
              }
            </p>
            
            <Link href="/ebooks/new" style={{
              textDecoration: 'none'
            }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#7c3aed',
                backgroundImage: 'linear-gradient(to right, #8b5cf6, #6d28d9)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 'medium'
              }}>
                <BookPlus style={{marginRight: '0.5rem'}} size={16} />
                Criar meu primeiro E-book
              </button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
} 