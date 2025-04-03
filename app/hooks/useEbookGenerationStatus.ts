'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { generationApi } from './api';
import { supabase } from '../lib/supabase';
import { GenerationProgress, EbookStatus } from '../types/ebook';

// Chaves de consulta
export const generationKeys = {
  all: ['generation'] as const,
  status: (ebookId: string) => [...generationKeys.all, 'status', ebookId] as const,
};

export function useEbookGenerationStatus(ebookId?: string) {
  const queryClient = useQueryClient();
  
  // Configurar consulta para buscar o status de geração
  const {
    data: progress,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ebookId ? generationKeys.status(ebookId) : ['generation', 'status', 'placeholder'],
    queryFn: () => ebookId ? generationApi.getGenerationStatus(ebookId) : null,
    enabled: !!ebookId,
    // Verificar automaticamente a cada 3 segundos se o processo estiver em andamento
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      // Parar de verificar se o processo estiver completo ou falhou
      return (data.status === 'completed' || data.status === 'failed') ? false : 3000;
    },
  });

  // Mutation para iniciar a geração
  const { mutateAsync: startGeneration, isPending: isStarting } = useMutation({
    mutationFn: () => ebookId ? generationApi.startGeneration(ebookId) : Promise.reject('ID não fornecido'),
    onSuccess: () => {
      // Forçar uma atualização do status após iniciar a geração
      queryClient.invalidateQueries({ queryKey: generationKeys.status(ebookId as string) });
    },
  });

  // Configurar Supabase Realtime para atualizações em tempo real
  useEffect(() => {
    if (!ebookId) return;

    // Inscrever-se para atualizações na tabela ebooks filtrada pelo ID
    const subscription = supabase
      .channel(`ebook-status-${ebookId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'ebooks',
        filter: `id=eq.${ebookId}`,
      }, (payload) => {
        // Quando receber uma atualização, invalidar a consulta para recarregar os dados
        queryClient.invalidateQueries({ queryKey: generationKeys.status(ebookId) });
      })
      .subscribe();

    // Limpar a inscrição quando o componente for desmontado
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [ebookId, queryClient]);

  // Calcula uma mensagem amigável baseada no status
  const getStatusMessage = useCallback(() => {
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
    isLoading,
    isStarting,
    error: error?.message,
    refetch,
    startGeneration,
    statusMessage: getStatusMessage(),
    isCompleted: progress?.status === 'completed',
    isFailed: progress?.status === 'failed',
    isGenerating: progress?.status === 'generating_toc' || 
                 progress?.status === 'generating_chapters' || 
                 progress?.status === 'generating_cover',
  };
} 