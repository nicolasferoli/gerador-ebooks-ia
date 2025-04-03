'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash, BookOpen, Edit, ChevronDown } from 'lucide-react';
import { Ebook } from '../../../types/ebook';

export default function EditEbookPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEbook = async () => {
      try {
        setIsLoading(true);
        
        // Em uma implementação real, isso faria uma chamada à API
        // Simulação de resposta para teste
        setTimeout(() => {
          // Dados de demonstração
          const demoEbook: Ebook = {
            id: id,
            title: 'Introdução ao React e TypeScript',
            description: 'Um guia abrangente para iniciantes em React e TypeScript. Aprenda sobre componentes, hooks, e tipagem estática.',
            coverImageUrl: null,
            status: 'draft',
            createdAt: '2023-11-20T10:30:43.511Z',
            updatedAt: '2023-11-21T15:45:43.511Z',
            userId: 'user1',
            templateId: 'template1',
            progress: 0,
            tocGenerated: true,
            chapters: [
              { 
                id: '1', 
                ebookId: id, 
                number: 1, 
                title: 'Introdução ao React', 
                content: 'Conteúdo do capítulo introdutório...', 
                status: 'completed',
                createdAt: '2023-11-20T10:35:43.511Z',
                updatedAt: '2023-11-20T11:00:43.511Z'
              },
              { 
                id: '2', 
                ebookId: id, 
                number: 2, 
                title: 'TypeScript Básico', 
                content: 'Conteúdo sobre TypeScript...', 
                status: 'pending',
                createdAt: '2023-11-20T11:30:43.511Z',
                updatedAt: '2023-11-20T12:00:43.511Z'
              },
              { 
                id: '3', 
                ebookId: id, 
                number: 3, 
                title: 'Hooks no React', 
                content: 'Conteúdo sobre hooks...', 
                status: 'pending',
                createdAt: '2023-11-20T12:30:43.511Z',
                updatedAt: '2023-11-20T13:00:43.511Z'
              }
            ]
          };
          
          setEbook(demoEbook);
          setIsLoading(false);
        }, 1000);
        
      } catch (err) {
        setError('Erro ao carregar o e-book. Tente novamente mais tarde.');
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchEbook();
    }
  }, [id]);
  
  if (isLoading) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #7c3aed',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p style={{
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>Carregando e-book...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        textAlign: 'center'
      }}>
        <div style={{
          padding: '2rem',
          border: '1px solid #f3f4f6',
          borderRadius: '0.5rem',
          backgroundColor: 'white'
        }}>
          <p style={{
            color: '#ef4444',
            marginBottom: '1rem'
          }}>{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#7c3aed',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Voltar para o Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (!ebook) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        textAlign: 'center'
      }}>
        <div style={{
          padding: '2rem',
          border: '1px solid #f3f4f6',
          borderRadius: '0.5rem',
          backgroundColor: 'white'
        }}>
          <p style={{
            color: '#6b7280',
            marginBottom: '1rem'
          }}>E-book não encontrado.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#7c3aed',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Voltar para o Dashboard
          </button>
        </div>
      </div>
    );
  }

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  };
  
  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem'
  };
  
  const backButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    color: '#7c3aed',
    fontSize: '0.875rem',
    fontWeight: 'medium',
    transition: 'color 150ms',
    textDecoration: 'none',
    marginRight: '1rem'
  };
  
  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    flex: '1'
  };
  
  const actionButtonsStyle = {
    display: 'flex',
    gap: '0.5rem'
  };
  
  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 'medium'
  };
  
  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
  };
  
  const whiteButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'white',
    color: '#7c3aed',
    border: '1px solid #e5e7eb'
  };
  
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    marginBottom: '1.5rem'
  };
  
  const chapterCardStyle = {
    ...cardStyle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem'
  };
  
  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <Link href="/dashboard" style={backButtonStyle}>
          <ArrowLeft style={{marginRight: '0.25rem'}} size={16} />
          Voltar
        </Link>
        
        <h1 style={titleStyle}>
          {ebook.title}
        </h1>
        
        <div style={actionButtonsStyle}>
          <button style={whiteButtonStyle}>
            <BookOpen style={{marginRight: '0.5rem'}} size={16} />
            Visualizar
          </button>
          
          <button style={buttonStyle}>
            <Save style={{marginRight: '0.5rem'}} size={16} />
            Salvar
          </button>
          
          <button style={dangerButtonStyle}>
            <Trash style={{marginRight: '0.5rem'}} size={16} />
            Excluir
          </button>
        </div>
      </header>
      
      <section style={cardStyle}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 'semibold',
          marginBottom: '1rem'
        }}>
          Informações do E-book
        </h2>
        
        <div style={{marginBottom: '1rem'}}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 'medium',
            color: '#4b5563',
            marginBottom: '0.5rem'
          }}>
            Título
          </label>
          <input 
            type="text" 
            value={ebook.title}
            onChange={(e) => setEbook({...ebook, title: e.target.value})}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb',
              fontSize: '0.875rem'
            }}
          />
        </div>
        
        <div style={{marginBottom: '1rem'}}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 'medium',
            color: '#4b5563',
            marginBottom: '0.5rem'
          }}>
            Descrição
          </label>
          <textarea 
            value={ebook.description}
            onChange={(e) => setEbook({...ebook, description: e.target.value})}
            rows={4}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb',
              fontSize: '0.875rem',
              resize: 'vertical'
            }}
          />
        </div>
      </section>
      
      <section>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 'semibold'
          }}>
            Capítulos
          </h2>
          
          <button style={buttonStyle}>
            <Edit style={{marginRight: '0.5rem'}} size={16} />
            Adicionar Capítulo
          </button>
        </div>
        
        {ebook.chapters.map((chapter) => (
          <div key={chapter.id} style={chapterCardStyle}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '9999px',
                backgroundColor: '#f3e8ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                marginRight: '0.75rem'
              }}>
                {chapter.number}
              </div>
              <div>
                <h3 style={{
                  fontWeight: 'medium',
                  fontSize: '1rem',
                  color: '#1f2937'
                }}>
                  {chapter.title}
                </h3>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  {chapter.status === 'completed' ? 'Concluído' : 
                   chapter.status === 'generating' ? 'Gerando...' : 'Pendente'}
                </span>
              </div>
            </div>
            
            <button style={{
              display: 'flex',
              alignItems: 'center',
              color: '#7c3aed',
              fontSize: '0.875rem',
              fontWeight: 'medium',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}>
              Editar Conteúdo
              <ChevronDown style={{
                width: '1rem',
                height: '1rem',
                marginLeft: '0.25rem',
                transform: 'rotate(-90deg)'
              }} />
            </button>
          </div>
        ))}
      </section>
    </div>
  );
} 