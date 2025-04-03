'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layouts/MainLayout';
import { BookOpen, BarChart2, Download, Plus, Eye, ChevronRight, Search } from 'lucide-react';

// Configuração para o Next.js
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [screenSize, setScreenSize] = useState({
    isSmall: false,
    isMedium: false,
    isLarge: false
  });

  useEffect(() => {
    // Função para verificar o tamanho da tela
    const checkScreenSize = () => {
      setScreenSize({
        isSmall: window.innerWidth < 640,
        isMedium: window.innerWidth >= 640 && window.innerWidth < 1024,
        isLarge: window.innerWidth >= 1024
      });
    };
    
    // Verificar o tamanho inicial
    checkScreenSize();
    
    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Configurações responsivas para os grids
  const statsGridCols = screenSize.isLarge ? 'repeat(3, 1fr)' : 
                        screenSize.isMedium ? 'repeat(2, 1fr)' : '1fr';
  
  const ebooksGridCols = screenSize.isLarge ? 'repeat(3, 1fr)' : 
                         screenSize.isMedium ? 'repeat(2, 1fr)' : '1fr';

  const demoEbooks = [
    {
      id: '1',
      title: 'Marketing Digital para Iniciantes',
      description: 'Um guia completo para quem está começando no marketing digital',
      coverUrl: '/placeholder-cover.jpg',
      progress: 100,
      status: 'completed',
    },
    {
      id: '2',
      title: 'Estratégias de SEO em 2023',
      description: 'As melhores práticas de SEO para aumentar seu tráfego orgânico',
      coverUrl: '/placeholder-cover.jpg',
      progress: 60,
      status: 'processing',
    },
  ];

  return (
    <MainLayout>
      <div style={{width: '100%', maxWidth: '1200px', margin: '0 auto'}}>
        <header style={{marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div>
            <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Dashboard</h1>
            <p style={{color: '#6b7280'}}>Bem-vindo ao seu Gerador de E-books</p>
          </div>

          <button 
            style={{
              backgroundColor: '#6d28d9',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: 'none',
              fontWeight: 500,
              alignSelf: 'flex-start',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            <span>Novo E-book</span>
          </button>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: statsGridCols,
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
              <div>
                <h3 style={{color: '#6b7280', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem'}}>E-books Gerados</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#6d28d9'}}>{demoEbooks.length}</p>
              </div>
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#f5f3ff',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <BookOpen size={18} style={{color: '#6d28d9'}} />
              </div>
            </div>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              color: '#6d28d9',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}>
              Ver todos <ChevronRight size={16} style={{marginLeft: '0.25rem'}} />
            </a>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
              <div>
                <h3 style={{color: '#6b7280', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem'}}>Em Progresso</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6'}}>1</p>
              </div>
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#eff6ff',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <BarChart2 size={18} style={{color: '#3b82f6'}} />
              </div>
            </div>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              color: '#3b82f6',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}>
              Ver andamento <ChevronRight size={16} style={{marginLeft: '0.25rem'}} />
            </a>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
              <div>
                <h3 style={{color: '#6b7280', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem'}}>Downloads</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981'}}>12</p>
              </div>
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#ecfdf5',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Download size={18} style={{color: '#10b981'}} />
              </div>
            </div>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              color: '#10b981',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}>
              Ver histórico <ChevronRight size={16} style={{marginLeft: '0.25rem'}} />
            </a>
          </div>
        </div>

        <section style={{marginBottom: '2rem'}}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold'}}>E-books Recentes</h2>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}>
              <div style={{
                position: 'relative',
                maxWidth: '12rem',
              }}>
                <Search size={16} style={{
                  position: 'absolute',
                  left: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                }} />
                <input 
                  type="text" 
                  placeholder="Buscar e-book" 
                  style={{
                    paddingLeft: '2rem',
                    paddingRight: '0.5rem',
                    paddingTop: '0.375rem',
                    paddingBottom: '0.375rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    fontSize: '0.875rem',
                    width: '100%',
                  }}
                />
              </div>
              
              <select style={{
                paddingLeft: '0.5rem',
                paddingRight: '0.5rem',
                paddingTop: '0.375rem',
                paddingBottom: '0.375rem',
                borderRadius: '0.375rem',
                border: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                fontSize: '0.875rem',
              }}>
                <option value="recent">Mais recentes</option>
                <option value="alphabetical">Alfabética</option>
                <option value="progress">Em progresso</option>
              </select>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: ebooksGridCols,
            gap: '1rem',
          }}>
            {demoEbooks.map(ebook => (
              <div key={ebook.id} style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #f3f4f6',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{
                  height: '10rem',
                  background: 'linear-gradient(to right, #7c3aed, #4f46e5)',
                  position: 'relative',
                }}>
                  <BookOpen size={32} style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    opacity: 0.7,
                  }} />
                  
                  {ebook.status === 'processing' && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '0.25rem',
                      backgroundColor: '#e5e7eb',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${ebook.progress}%`,
                        backgroundColor: '#3b82f6',
                      }} />
                    </div>
                  )}
                </div>
                
                <div style={{
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  }}>{ebook.title}</h3>
                  
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1,
                  }}>
                    {ebook.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto',
                  }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      backgroundColor: ebook.status === 'completed' ? '#dcfce7' : '#dbeafe',
                      color: ebook.status === 'completed' ? '#16a34a' : '#2563eb',
                    }}>
                      {ebook.status === 'completed' ? 'Concluído' : 'Em Progresso'}
                    </span>
                    
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      color: '#6d28d9',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}>
                      <Eye size={16} />
                      <span>Visualizar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
} 