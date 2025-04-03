import useSWR from 'swr';
import { useCallback } from 'react';
import { GenerationProgress } from '../types/ebook';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Erro ao buscar dados');
  }
  
  return response.json();
};

export function useGenerationStatus(ebookId?: string) {
  const { 
    data: progress, 
    error,
    mutate
  } = useSWR<GenerationProgress>(
    ebookId ? `/api/ebooks/${ebookId}/status` : null,
    fetcher,
    {
      refreshInterval: (data) => {
        // Parar de verificar se o processo estiver completo ou falhou
        if (data?.status === 'completed' || data?.status === 'failed') {
          return 0;
        }
        // Verificar a cada 2 segundos
        return 2000;
      },
    }
  );

  // Força uma atualização manual dos dados
  const refreshStatus = useCallback(() => {
    if (ebookId) {
      mutate();
    }
  }, [ebookId, mutate]);

  // Calcula uma mensagem amigável baseada no status
  const statusMessage = useCallback(() => {
    if (!progress) return 'Preparando geração...';

    switch (progress.status) {
      case 'draft':
        return 'Ebook em rascunho. Clique em "Gerar" para iniciar.';
      case 'generating_toc':
        return 'Gerando sumário...';
      case 'generating_chapters':
        return `Gerando capítulos... ${Math.round(progress.progress)}%`;
      case 'generating_cover':
        return 'Criando capa do ebook...';
      case 'completed':
        return 'Geração concluída com sucesso!';
      case 'failed':
        return `Erro na geração: ${progress.message}`;
      default:
        return 'Processando...';
    }
  }, [progress]);

  return {
    progress,
    isLoading: !error && !progress && !!ebookId,
    error: error?.message,
    refreshStatus,
    statusMessage: statusMessage(),
    isCompleted: progress?.status === 'completed',
    isFailed: progress?.status === 'failed',
    isGenerating: progress?.status === 'generating_toc' || 
                 progress?.status === 'generating_chapters' || 
                 progress?.status === 'generating_cover',
  };
} 