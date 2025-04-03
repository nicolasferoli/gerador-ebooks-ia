'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookPlus, Sparkles, ChevronDown } from 'lucide-react';

// Templates disponíveis para seleção
const availableTemplates = [
  {
    id: 'template1',
    name: 'Livro Técnico',
    description: 'Para guias, tutoriais e documentação técnica',
    icon: '📚'
  },
  {
    id: 'template2',
    name: 'Romance',
    description: 'Para histórias de ficção com personagens e enredo',
    icon: '📖'
  },
  {
    id: 'template3',
    name: 'Manual Educativo',
    description: 'Para materiais didáticos ou educacionais',
    icon: '🎓'
  },
  {
    id: 'template4',
    name: 'Conteúdo de Marketing',
    description: 'Para white papers, e-books promocionais',
    icon: '📊'
  }
];

export default function NewEbookPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  
  // Estados para armazenar as informações do e-book
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Função para avançar para o próximo passo
  const goToNextStep = () => {
    if (step === 1 && !title.trim()) {
      alert('Por favor, insira um título para o e-book');
      return;
    }
    
    if (step === 3 && !selectedTemplateId) {
      alert('Por favor, selecione um template');
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleCreateEbook();
    }
  };
  
  // Função para voltar ao passo anterior
  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Criar o e-book
  const handleCreateEbook = async () => {
    try {
      setIsCreating(true);
      
      // Simulação de criação com atraso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Em uma implementação real, isso enviaria os dados para a API
      console.log('Criando e-book:', {
        title,
        description,
        topic,
        templateId: selectedTemplateId
      });
      
      // Redirecionar para a página de edição do novo e-book
      // Aqui usamos um ID falso para demonstração
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Erro ao criar e-book:', error);
      setIsCreating(false);
    }
  };
  
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  };
  
  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
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
    color: '#1f2937'
  };
  
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    marginBottom: '1.5rem'
  };
  
  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 'medium',
    transition: 'background-color 150ms'
  };
  
  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'white',
    color: '#7c3aed',
    border: '1px solid #e5e7eb'
  };
  
  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  };
  
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid #e5e7eb',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  };
  
  const textareaStyle = {
    ...inputStyle,
    minHeight: '8rem'
  } as React.CSSProperties;
  
  const templateCardStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'border-color 150ms, box-shadow 150ms',
    marginBottom: '1rem'
  };
  
  const selectedTemplateCardStyle = {
    ...templateCardStyle,
    borderColor: '#7c3aed',
    boxShadow: '0 0 0 1px #7c3aed'
  };
  
  const templateGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  };
  
  // Renderiza o conteúdo baseado no passo atual
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'semibold',
              marginBottom: '1rem'
            }}>
              Passo 1: Informações Básicas
            </h2>
            
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '1.5rem'
            }}>
              Vamos começar com algumas informações básicas sobre o seu e-book.
            </p>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 'medium',
                color: '#4b5563',
                marginBottom: '0.5rem'
              }}>
                Título do E-book
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Guia Completo de React para Iniciantes"
                style={inputStyle}
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
                Descrição (opcional)
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva brevemente o conteúdo do seu e-book..."
                style={textareaStyle}
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'semibold',
              marginBottom: '1rem'
            }}>
              Passo 2: Defina o Tópico Principal
            </h2>
            
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '1.5rem'
            }}>
              Defina o tópico ou assunto principal que seu e-book abordará.
              Isso ajudará nossa IA a gerar conteúdo mais relevante.
            </p>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 'medium',
                color: '#4b5563',
                marginBottom: '0.5rem'
              }}>
                Tópico Principal
              </label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Programação React para iniciantes, incluindo componentes, hooks e roteamento."
                style={textareaStyle}
              />
            </div>
            
            <div style={{
              borderRadius: '0.5rem',
              backgroundColor: '#f3e8ff',
              padding: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              marginTop: '1.5rem'
            }}>
              <Sparkles size={18} style={{color: '#7c3aed', marginTop: '0.125rem'}} />
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                  color: '#7c3aed',
                  marginBottom: '0.25rem'
                }}>
                  Dica de IA
                </p>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  Seja específico sobre o tópico e inclua detalhes sobre o nível (iniciante, intermediário, avançado) 
                  e os principais conceitos que você quer abordar.
                </p>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'semibold',
              marginBottom: '1rem'
            }}>
              Passo 3: Escolha um Template
            </h2>
            
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '1.5rem'
            }}>
              Escolha um modelo que se adapte ao tipo de conteúdo que você está criando.
            </p>
            
            <div style={templateGridStyle}>
              {availableTemplates.map((template) => (
                <div 
                  key={template.id} 
                  style={template.id === selectedTemplateId ? selectedTemplateCardStyle : templateCardStyle}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.75rem'
                  }}>
                    <span style={{
                      fontSize: '1.5rem',
                      marginRight: '0.75rem'
                    }}>
                      {template.icon}
                    </span>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 'medium',
                      color: '#1f2937'
                    }}>
                      {template.name}
                    </h3>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    {template.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <Link href="/dashboard" style={backButtonStyle}>
          <ArrowLeft style={{marginRight: '0.25rem'}} size={16} />
          Voltar para o Dashboard
        </Link>
        
        <h1 style={titleStyle}>
          Criar Novo E-book
        </h1>
      </header>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center'
        }}>
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div style={{
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                backgroundColor: stepNumber === step ? '#7c3aed' :
                                 stepNumber < step ? '#c4b5fd' : '#f3f4f6',
                color: stepNumber === step ? 'white' :
                       stepNumber < step ? 'white' : '#6b7280',
                fontWeight: 'medium',
                fontSize: '0.875rem',
                zIndex: 10
              }}>
                {stepNumber}
              </div>
              
              {stepNumber < 3 && (
                <div style={{
                  height: '2px',
                  width: '2rem',
                  backgroundColor: stepNumber < step ? '#c4b5fd' : '#f3f4f6'
                }}></div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div style={{
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Passo {step} de 3
        </div>
      </div>
      
      <div style={cardStyle}>
        {renderStepContent()}
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '2rem'
        }}>
          {step > 1 ? (
            <button 
              style={secondaryButtonStyle}
              onClick={goToPreviousStep}
            >
              Voltar
            </button>
          ) : (
            <div></div>
          )}
          
          <button 
            style={isCreating ? disabledButtonStyle : buttonStyle}
            onClick={goToNextStep}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <span style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  animation: 'spin 1s linear infinite',
                  marginRight: '0.5rem'
                }}></span>
                Criando...
              </>
            ) : step < 3 ? (
              'Continuar'
            ) : (
              <>
                <BookPlus style={{marginRight: '0.5rem'}} size={16} />
                Criar E-book
              </>
            )}
          </button>
        </div>
      </div>
      
      <div style={{
        borderRadius: '0.5rem',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        padding: '1rem',
        marginTop: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#64748b'
        }}>
          <Sparkles size={16} style={{color: '#7c3aed'}} />
          <span>Nossa inteligência artificial ajudará a gerar um e-book incrível a partir das suas informações.</span>
        </div>
      </div>
    </div>
  );
} 