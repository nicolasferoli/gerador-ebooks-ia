'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, BookPlus, Sparkles, Clock, CheckCircle, 
  LoaderCircle, PenLine, Palette, Layout, Book, X, 
  MessageSquare, CalendarClock, Layers, AlertCircle,
  Info, Eye
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ebookApi, generationApi } from '../../hooks/api';
import { EbookCreationData } from '../../types/ebook';

// Templates disponíveis para seleção
const templates = [
  {
    id: 'template1',
    name: 'Livro Técnico',
    description: 'Para guias, tutoriais e documentação técnica',
    icon: '📚',
    colors: ['#7c3aed', '#4f46e5', '#2563eb', '#0ea5e9', '#06b6d4'],
    preview: {
      titleStyle: 'Capítulo 1: Introdução',
      paragraphStyle: 'Texto técnico com explicações detalhadas e exemplos práticos.',
      layout: 'academic'
    }
  },
  {
    id: 'template2',
    name: 'Romance',
    description: 'Para histórias de ficção com personagens e enredo',
    icon: '📖',
    colors: ['#ec4899', '#d946ef', '#8b5cf6', '#6366f1', '#3b82f6'],
    preview: {
      titleStyle: 'O Início da Jornada',
      paragraphStyle: 'Narrativa envolvente com desenvolvimento de personagens e ambientação rica.',
      layout: 'story'
    }
  },
  {
    id: 'template3',
    name: 'Manual Educativo',
    description: 'Para materiais didáticos ou educacionais',
    icon: '🎓',
    colors: ['#10b981', '#059669', '#0d9488', '#0891b2', '#0284c7'],
    preview: {
      titleStyle: 'Lição 1 - Fundamentos',
      paragraphStyle: 'Conteúdo educativo estruturado com conceitos claros e exercícios práticos.',
      layout: 'educational'
    }
  },
  {
    id: 'template4',
    name: 'Conteúdo de Marketing',
    description: 'Para white papers, e-books promocionais',
    icon: '📊',
    colors: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
    preview: {
      titleStyle: 'Estratégias Eficazes',
      paragraphStyle: 'Análises de mercado, dicas práticas e estudos de caso relevantes.',
      layout: 'marketing'
    }
  }
];

const languages = [
  { id: 'pt', name: 'Português' },
  { id: 'en', name: 'Inglês' },
  { id: 'es', name: 'Espanhol' }
];

// Componente principal
export default function NewEbookPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Estado para controlar a etapa atual
  const [step, setStep] = useState(1);
  
  // Estado para armazenar dados do formulário
  const [formData, setFormData] = useState<EbookCreationData & {
    color?: string;
    language?: string;
    numChapters?: number;
    specificTopics?: string;
    isPublic?: boolean;
  }>({
    title: '',
    description: '',
    templateId: '',
    color: '',
    language: 'pt',
    numChapters: 5,
    specificTopics: '',
    isPublic: true
  });
  
  // Estado para a tela de progresso
  const [progressModal, setProgressModal] = useState({
    show: false,
    status: 'initializing',
    message: 'Inicializando seu e-book...',
    progress: 0,
    currentChapter: 0,
    ebook: null as any
  });

  // Estado de validação
  const [errors, setErrors] = useState({
    title: '',
    templateId: '',
    color: ''
  });
  
  // Mutação para criar o e-book
  const createEbookMutation = useMutation({
    mutationFn: () => ebookApi.createEbook({
      title: formData.title,
      description: formData.description,
      templateId: formData.templateId
    }),
    onSuccess: (ebook) => {
      setProgressModal(prev => ({
        ...prev,
        ebook,
        show: true,
        status: 'created',
        message: 'E-book criado com sucesso. Iniciando geração do sumário...'
      }));
      startEbookGeneration(ebook.id);
    },
    onError: (error: Error) => {
      console.error('Erro ao criar e-book:', error);
      alert(`Erro ao criar e-book: ${error.message}`);
    }
  });
  
  // Mutação para gerar o sumário
  const generateTocMutation = useMutation({
    mutationFn: (ebookId: string) => 
      fetch(`/api/ebooks/${ebookId}/generate-toc`, {
        method: 'POST'
      }).then(res => {
        if (!res.ok) throw new Error('Falha ao gerar sumário');
        return res.json();
      }),
    onSuccess: (data, ebookId) => {
      setProgressModal(prev => ({
        ...prev,
        status: 'generating_chapters',
        message: 'Sumário gerado. Iniciando geração dos capítulos...'
      }));
      startChapterGeneration(ebookId, 1);
    },
    onError: (error: Error) => {
      console.error('Erro ao gerar sumário:', error);
      setProgressModal(prev => ({
        ...prev,
        status: 'failed',
        message: `Erro ao gerar sumário: ${error.message}`
      }));
    }
  });
  
  // Mutação para gerar capítulo
  const generateChapterMutation = useMutation({
    mutationFn: ({ ebookId, chapterNumber }: { ebookId: string, chapterNumber: number }) => 
      fetch(`/api/ebooks/${ebookId}/generate-chapter/${chapterNumber}`, {
        method: 'POST'
      }).then(res => {
        if (!res.ok) throw new Error(`Falha ao gerar capítulo ${chapterNumber}`);
        return res.json();
      }),
    onSuccess: (data, variables) => {
      const { ebookId, chapterNumber } = variables;
      const nextChapter = chapterNumber + 1;
      const progress = Math.round((chapterNumber / formData.numChapters!) * 100);
      
      setProgressModal(prev => ({
        ...prev,
        progress,
        currentChapter: chapterNumber,
        message: `Capítulo ${chapterNumber} gerado. Progresso: ${progress}%`
      }));
      
      // Verificar se já terminou todos os capítulos
      if (chapterNumber >= formData.numChapters!) {
        generateCoverMutation.mutate(ebookId);
      } else {
        // Gerar próximo capítulo
        startChapterGeneration(ebookId, nextChapter);
      }
    },
    onError: (error: Error, variables) => {
      console.error(`Erro ao gerar capítulo ${variables.chapterNumber}:`, error);
      setProgressModal(prev => ({
        ...prev,
        status: 'failed',
        message: `Erro ao gerar capítulo ${variables.chapterNumber}: ${error.message}`
      }));
    }
  });
  
  // Mutação para gerar capa
  const generateCoverMutation = useMutation({
    mutationFn: (ebookId: string) => 
      fetch(`/api/ebooks/${ebookId}/generate-cover`, {
        method: 'POST'
      }).then(res => {
        if (!res.ok) throw new Error('Falha ao gerar capa');
        return res.json();
      }),
    onSuccess: (data, ebookId) => {
      setProgressModal(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        message: 'E-book gerado com sucesso!'
      }));
      
      // Aguardar 2 segundos antes de redirecionar para a página de edição
      setTimeout(() => {
        router.push(`/ebooks/${ebookId}/edit`);
      }, 2000);
    },
    onError: (error: Error) => {
      console.error('Erro ao gerar capa:', error);
      setProgressModal(prev => ({
        ...prev,
        status: 'failed',
        message: `Erro ao gerar capa: ${error.message}`
      }));
    }
  });
  
  // Função para iniciar o processo de geração
  const startEbookGeneration = async (ebookId: string) => {
    try {
      // Gerar sumário
      generateTocMutation.mutate(ebookId);
    } catch (error: any) {
      console.error('Erro ao iniciar geração do e-book:', error);
      setProgressModal(prev => ({
        ...prev,
        status: 'failed',
        message: `Erro ao iniciar geração: ${error.message}`
      }));
    }
  };
  
  // Função para iniciar a geração de um capítulo
  const startChapterGeneration = (ebookId: string, chapterNumber: number) => {
    generateChapterMutation.mutate({ ebookId, chapterNumber });
  };
  
  // Função para lidar com a mudança de campos do formulário
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erros quando o campo é editado
    if (name in errors) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Função para lidar com a seleção de template
  const handleTemplateSelect = (templateId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      templateId,
      // Se já houver uma cor selecionada para este template, manter
      color: prev.color && templates.find(t => t.id === templateId)?.colors.includes(prev.color)
        ? prev.color
        : templates.find(t => t.id === templateId)?.colors[0] || ''
    }));
    
    if (errors.templateId) {
      setErrors(prev => ({ ...prev, templateId: '' }));
    }
  };
  
  // Função para lidar com a seleção de cor
  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
    
    if (errors.color) {
      setErrors(prev => ({ ...prev, color: '' }));
    }
  };
  
  // Função para atualizar o número de capítulos
  const handleChapterCountChange = (value: number) => {
    setFormData(prev => ({ ...prev, numChapters: value }));
  };
  
  // Função para lidar com a alternância de compartilhamento público
  const handlePublicToggle = () => {
    setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }));
  };
  
  // Função para validar o formulário com base na etapa atual
  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };
    
    if (step === 1) {
      if (!formData.templateId) {
        newErrors.templateId = 'Selecione um template';
        isValid = false;
      }
      
      if (!formData.color) {
        newErrors.color = 'Selecione uma cor';
        isValid = false;
      }
    }
    
    if (step === 2) {
      if (!formData.title.trim()) {
        newErrors.title = 'O título é obrigatório';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Função para ir para a próxima etapa
  const handleNextStep = () => {
    if (validateForm()) {
      setStep(prev => prev + 1);
    }
  };
  
  // Função para voltar à etapa anterior
  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };
  
  // Função para iniciar a criação do ebook
  const handleCreateEbook = () => {
    if (validateForm()) {
      createEbookMutation.mutate();
    }
  };
  
  // Função para gerar uma descrição utilizando IA
  const handleGenerateDescription = async () => {
    if (!formData.title) {
      setErrors(prev => ({ ...prev, title: 'Insira um título para gerar a descrição' }));
      return;
    }
    
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title })
      });
      
      if (!response.ok) throw new Error('Falha ao gerar descrição');
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, description: data.description }));
      
    } catch (error: any) {
      console.error('Erro ao gerar descrição:', error);
      alert(`Erro ao gerar descrição: ${error.message}`);
    }
  };
  
  // Função para calcular a estimativa de tempo
  const getTimeEstimate = () => {
    const baseTime = 5; // minutos por capítulo
    const estimatedTime = baseTime * formData.numChapters!;
    
    if (estimatedTime < 60) {
      return `${estimatedTime} minutos`;
    }
    
    const hours = Math.floor(estimatedTime / 60);
    const minutes = estimatedTime % 60;
    
    if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    
    return `${hours} ${hours === 1 ? 'hora' : 'horas'} e ${minutes} minutos`;
  };
  
  // Componente de Template Card com Preview
  const TemplateCard = ({ template }: { template: typeof templates[0] }) => {
    const isSelected = formData.templateId === template.id;
    
    return (
      <div 
        className={`border rounded-lg p-4 cursor-pointer transition-all ${
          isSelected ? 'border-2 border-primary shadow-sm' : 'border-gray-200 hover:border-gray-300'
        }`}
        style={{
          borderColor: isSelected ? formData.color || '#7c3aed' : undefined,
          boxShadow: isSelected ? `0 1px 3px ${formData.color || '#7c3aed'}30` : undefined
        }}
        onClick={() => handleTemplateSelect(template.id)}
      >
        <div className="flex items-center mb-3">
          <span className="text-2xl mr-3">{template.icon}</span>
          <h3 className="text-base font-medium">{template.name}</h3>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">{template.description}</p>
        
        {/* Preview aprimorado do template */}
        <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden mb-3">
          <div 
            className="absolute top-0 left-0 w-full h-8"
            style={{ backgroundColor: formData.templateId === template.id ? formData.color : template.colors[0] }}
          ></div>
          
          <div className="absolute top-12 left-4 right-4">
            <div className={`text-sm font-medium mb-3 ${template.preview.layout === 'story' ? 'italic' : ''}`}>
              {template.preview.titleStyle}
            </div>
            <div className="w-full h-2 bg-gray-300 rounded mb-1.5"></div>
            <div className="w-full h-2 bg-gray-300 rounded mb-1.5"></div>
            <div className="w-3/4 h-2 bg-gray-300 rounded mb-3"></div>
            <div className="text-xs text-gray-500">
              {template.preview.paragraphStyle}
            </div>
          </div>
          
          {isSelected && (
            <div className="absolute bottom-2 right-2 flex items-center text-xs text-primary">
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </div>
          )}
        </div>
        
        {/* Seletor de cores */}
        <div className="flex flex-wrap gap-2 mt-2">
          {template.colors.map(color => (
            <button
              key={color}
              className={`w-5 h-5 rounded-full ${
                formData.color === color && formData.templateId === template.id
                  ? 'ring-2 ring-offset-2'
                  : ''
              }`}
              style={{ 
                backgroundColor: color,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (formData.templateId === template.id || !formData.templateId) {
                  handleTemplateSelect(template.id);
                  handleColorSelect(color);
                }
              }}
              aria-label={`Selecionar cor ${color}`}
            ></button>
          ))}
        </div>
      </div>
    );
  };
  
  // Componente do Modal de Progresso
  const ProgressModal = () => {
    if (!progressModal.show) return null;
    
    const getStatusIcon = () => {
      switch (progressModal.status) {
        case 'initializing':
        case 'created':
          return <LoaderCircle className="w-5 h-5 text-primary animate-spin" />;
        case 'generating_toc':
          return <PenLine className="w-5 h-5 text-primary animate-pulse" />;
        case 'generating_chapters':
          return <Book className="w-5 h-5 text-primary animate-pulse" />;
        case 'generating_cover':
          return <Palette className="w-5 h-5 text-primary animate-pulse" />;
        case 'completed':
          return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'failed':
          return <AlertCircle className="w-5 h-5 text-red-500" />;
        default:
          return <LoaderCircle className="w-5 h-5 text-primary animate-spin" />;
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Gerando seu E-book</h3>
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center text-sm">
              {getStatusIcon()}
              <span className="ml-2">{progressModal.message}</span>
            </div>
            
            {progressModal.status === 'generating_chapters' && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Capítulo {progressModal.currentChapter} de {formData.numChapters}</span>
                  <span>{progressModal.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ 
                      width: `${progressModal.progress}%`,
                      backgroundColor: formData.color || '#7c3aed'
                    }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>
                {progressModal.status === 'completed' 
                  ? 'Concluído!' 
                  : progressModal.status === 'failed'
                  ? 'Processo interrompido'
                  : 'Este processo pode levar alguns minutos'}
              </span>
            </div>
            
            {progressModal.status === 'completed' && (
              <div className="flex justify-center mt-2">
                <p className="text-sm text-gray-600">
                  Redirecionando para o editor...
                </p>
              </div>
            )}
            
            {progressModal.status === 'failed' && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-gray-200 rounded-md text-sm"
                >
                  Voltar ao Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Renderização do conteúdo com base na etapa atual
  const renderStepContent = () => {
    switch (step) {
      // Etapa 1: Seleção de template e cor
      case 1:
        return (
          <div>
            <h2 className="text-lg font-medium mb-3">
              <Layout className="w-5 h-5 inline mr-2 text-primary" />
              Selecione um Template e Cor
            </h2>
            
            <p className="text-sm text-gray-500 mb-4">
              Escolha o tipo de e-book que deseja criar e a cor principal que será usada no design.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {templates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
            
            {errors.templateId && (
              <p className="text-sm text-red-500 mt-1">{errors.templateId}</p>
            )}
            
            {errors.color && (
              <p className="text-sm text-red-500 mt-1">{errors.color}</p>
            )}
          </div>
        );
        
      // Etapa 2: Informações do e-book
      case 2:
        return (
          <div>
            <h2 className="text-lg font-medium mb-3">
              <Info className="w-5 h-5 inline mr-2 text-primary" />
              Informações do E-book
            </h2>
            
            <p className="text-sm text-gray-500 mb-4">
              Preencha os detalhes do seu e-book. Quanto mais informações, melhor será o resultado final.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do E-book *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Ex: Guia Completo de Programação Python"
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                )}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    className="text-xs text-primary flex items-center hover:text-primary-dark"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Gerar com IA
                  </button>
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Descreva o conteúdo do seu e-book..."
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={handlePublicToggle}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Tornar e-book público na biblioteca
                </label>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-md">
                <div className="flex">
                  <Sparkles className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Dica</p>
                    <p className="text-xs text-gray-600">
                      Seja específico na descrição. Quanto mais detalhes você fornecer, 
                      melhor será o resultado da geração do conteúdo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      // Etapa 3: Seleção de capítulos
      case 3:
        return (
          <div>
            <h2 className="text-lg font-medium mb-3">
              <Layers className="w-5 h-5 inline mr-2 text-primary" />
              Estrutura do E-book
            </h2>
            
            <p className="text-sm text-gray-500 mb-4">
              Defina quantos capítulos o seu e-book terá e forneça tópicos específicos se desejar.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quantidade de Capítulos: <span className="font-semibold">{formData.numChapters}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={formData.numChapters}
                  onChange={(e) => handleChapterCountChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    accentColor: formData.color || '#7c3aed'
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>15</span>
                  <span>30</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                <CalendarClock className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Tempo estimado de geração: <strong>{getTimeEstimate()}</strong>
                </span>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Tópicos Específicos (opcional)
                  </label>
                </div>
                <textarea
                  name="specificTopics"
                  value={formData.specificTopics}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Liste tópicos específicos que você gostaria de incluir, separados por vírgula..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Estes tópicos serão sugeridos ao algoritmo, mas o conteúdo final pode variar.
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex">
                  <MessageSquare className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Sobre o Processo</p>
                    <p className="text-xs text-gray-600">
                      Após iniciar a geração, você poderá acompanhar o progresso em tempo real.
                      O processo ocorre em etapas: primeiro criamos o sumário, depois cada capítulo,
                      e finalmente a capa do seu e-book.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Estilos básicos
  const buttonPrimaryStyle = {
    backgroundColor: formData.color || '#7c3aed'
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <header className="flex items-center mb-6">
        <Link href="/dashboard" className="text-primary flex items-center hover:underline mr-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900">
          Criar Novo E-book
        </h1>
      </header>
      
      {/* Progresso das etapas */}
      <div className="flex justify-between mb-6">
        <div className="flex items-center">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div 
                className={`relative w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium z-10
                  ${step === stepNumber 
                    ? 'text-white' 
                    : stepNumber < step 
                    ? 'text-white' 
                    : 'text-gray-500 bg-gray-100'
                  }`}
                style={{
                  backgroundColor: step === stepNumber 
                    ? formData.color || '#7c3aed'
                    : stepNumber < step 
                    ? '#c4b5fd'
                    : undefined
                }}
              >
                {stepNumber}
              </div>
              
              {stepNumber < 3 && (
                <div 
                  className="h-1 w-12 mx-1"
                  style={{
                    backgroundColor: stepNumber < step 
                      ? '#c4b5fd'
                      : '#e5e7eb'
                  }}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="text-sm text-gray-500">
          Etapa {step} de 3
        </div>
      </div>
      
      {/* Conteúdo da etapa atual */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
        {renderStepContent()}
        
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Voltar
            </button>
          ) : (
            <div></div>
          )}
          
          <button
            type="button"
            onClick={step < 3 ? handleNextStep : handleCreateEbook}
            className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white hover:opacity-90 transition-opacity duration-200 flex items-center"
            style={buttonPrimaryStyle}
            disabled={createEbookMutation.isPending}
          >
            {createEbookMutation.isPending ? (
              <>
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : step < 3 ? (
              'Continuar'
            ) : (
              <>
                <BookPlus className="w-4 h-4 mr-2" />
                Iniciar Geração
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Dica final */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center text-sm text-gray-600">
          <Sparkles className="w-5 h-5 text-primary mr-2" />
          <span>
            Nossa inteligência artificial gerará o conteúdo do seu e-book com base nas informações fornecidas.
          </span>
        </div>
      </div>
      
      {/* Modal de progresso */}
      <ProgressModal />
    </div>
  );
} 