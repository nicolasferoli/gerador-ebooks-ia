'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Book, 
  Calendar, 
  Download, 
  Share, 
  BookOpen, 
  Printer,
  Edit,
  Loader
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Função para buscar os dados do ebook
const fetchEbook = async (id: string) => {
  const response = await fetch(`/api/ebooks/${id}`);
  if (!response.ok) {
    throw new Error('Não foi possível carregar o e-book');
  }
  return response.json();
};

// Função para formatar a data
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export default function EbookPage() {
  const params = useParams();
  const router = useRouter();
  const ebookId = params.id as string;
  
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  
  // Buscar dados do ebook
  const { data: ebook, isLoading, error } = useQuery({
    queryKey: ['ebook', ebookId],
    queryFn: () => fetchEbook(ebookId)
  });
  
  // Buscar conteúdo do capítulo ativo
  const { data: chapterContent, isLoading: isLoadingChapter } = useQuery({
    queryKey: ['chapter', ebookId, activeChapter],
    queryFn: async () => {
      if (!activeChapter) return null;
      
      const response = await fetch(`/api/ebooks/${ebookId}/chapters/${activeChapter}`);
      if (!response.ok) {
        throw new Error('Não foi possível carregar o capítulo');
      }
      return response.json();
    },
    enabled: !!activeChapter,
  });
  
  // Efeito para definir o primeiro capítulo como ativo quando o ebook for carregado
  useEffect(() => {
    if (ebook && ebook.chapters && ebook.chapters.length > 0 && !activeChapter) {
      setActiveChapter(ebook.chapters[0].number);
    }
  }, [ebook, activeChapter]);
  
  // Função para voltar à página anterior
  const handleBack = () => {
    router.back();
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-gray-600">Carregando e-book...</p>
      </div>
    );
  }
  
  if (error || !ebook) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-red-500 mb-4">Erro ao carregar o e-book. Por favor, tente novamente.</p>
        <button 
          onClick={handleBack}
          className="flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      {/* Cabeçalho */}
      <div className="mb-6">
        <button 
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </button>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Capa do e-book */}
          <div className="lg:w-1/3">
            {ebook.coverImageUrl ? (
              <div className="relative w-full aspect-[3/4] shadow-lg rounded-lg overflow-hidden">
                <Image 
                  src={ebook.coverImageUrl} 
                  alt={ebook.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full aspect-[3/4] bg-gray-100 rounded-lg border border-gray-200">
                <Book className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">Criado em {formatDate(ebook.createdAt)}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark text-sm">
                  <Download className="w-4 h-4 mr-1.5" />
                  PDF
                </button>
                <button className="flex items-center px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                  <Share className="w-4 h-4 mr-1.5" />
                  Compartilhar
                </button>
                <button className="flex items-center px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                  <Edit className="w-4 h-4 mr-1.5" />
                  Editar
                </button>
              </div>
            </div>
          </div>
          
          {/* Detalhes do e-book */}
          <div className="lg:w-2/3">
            <h1 className="text-3xl font-bold mb-3">{ebook.title}</h1>
            <p className="text-gray-700 mb-6">{ebook.description}</p>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Sumário</h2>
              <div className="bg-gray-50 rounded-lg p-4 divide-y divide-gray-200">
                {ebook.chapters?.map((chapter: any) => (
                  <button
                    key={chapter.id}
                    className={`w-full text-left py-2.5 px-3 rounded ${
                      activeChapter === chapter.number
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveChapter(chapter.number)}
                  >
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>Capítulo {chapter.number}: {chapter.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Conteúdo do capítulo */}
      {activeChapter && (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold mb-6">
              Capítulo {activeChapter}: {
                ebook.chapters?.find((c: any) => c.number === activeChapter)?.title
              }
            </h2>
            
            {isLoadingChapter ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : (
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: chapterContent?.content || 'Conteúdo não disponível.'
                }}
              />
            )}
          </div>
          
          {/* Navegação entre capítulos */}
          <div className="flex justify-between mt-6">
            <button
              className={`px-4 py-2 flex items-center rounded-md ${
                activeChapter > 1
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'opacity-50 cursor-not-allowed bg-gray-100'
              }`}
              onClick={() => activeChapter > 1 && setActiveChapter(activeChapter - 1)}
              disabled={activeChapter <= 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Capítulo anterior
            </button>
            
            <button
              className={`px-4 py-2 flex items-center rounded-md ${
                ebook.chapters && activeChapter < ebook.chapters.length
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'opacity-50 cursor-not-allowed bg-gray-100'
              }`}
              onClick={() => {
                if (ebook.chapters && activeChapter < ebook.chapters.length) {
                  setActiveChapter(activeChapter + 1);
                }
              }}
              disabled={!ebook.chapters || activeChapter >= ebook.chapters.length}
            >
              Próximo capítulo
              <ArrowLeft className="w-4 h-4 ml-2 transform rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 