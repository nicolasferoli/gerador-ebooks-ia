'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { chaptersApi } from './api';
import { supabase } from '../lib/supabase';
import { Chapter } from '../types/ebook';

// Chaves de consulta
export const chapterKeys = {
  all: ['chapters'] as const,
  lists: () => [...chapterKeys.all, 'list'] as const,
  list: (ebookId: string, filters: Record<string, any>) => 
    [...chapterKeys.lists(), ebookId, filters] as const,
  details: () => [...chapterKeys.all, 'detail'] as const,
  detail: (id: string) => [...chapterKeys.details(), id] as const,
};

export function useEbookChapters(ebookId?: string, initialPage = 1, pageSize = 10) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(pageSize);
  
  // Resetar para página 1 quando o ebookId mudar
  useEffect(() => {
    setPage(1);
  }, [ebookId]);

  // Buscar capítulos com paginação
  const {
    data,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ebookId 
      ? chapterKeys.list(ebookId, { page, limit })
      : ['chapters', 'list', 'placeholder'],
    queryFn: () => ebookId 
      ? chaptersApi.getEbookChapters(ebookId, page, limit)
      : null,
    enabled: !!ebookId,
  });

  // Atualizar um capítulo
  const { mutateAsync: updateChapter, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Chapter> }) => 
      chaptersApi.updateChapter(id, updates),
    onSuccess: (updatedChapter) => {
      // Atualizar o cache após a atualização bem-sucedida
      queryClient.invalidateQueries({
        queryKey: chapterKeys.detail(updatedChapter.id)
      });
      
      // Atualizar a lista de capítulos se estiver carregada
      if (ebookId) {
        queryClient.invalidateQueries({
          queryKey: chapterKeys.list(ebookId, { page, limit })
        });
      }
    },
  });

  // Configurar Supabase Realtime para atualizações em tempo real
  useEffect(() => {
    if (!ebookId) return;

    // Inscrever-se para atualizações na tabela de capítulos
    const subscription = supabase
      .channel(`ebook-chapters-${ebookId}`)
      .on('postgres_changes', {
        event: '*', // INSERT, UPDATE, ou DELETE
        schema: 'public',
        table: 'ebook_chapters',
        filter: `ebook_id=eq.${ebookId}`,
      }, (payload) => {
        // Quando receber uma atualização, invalidar as consultas relevantes
        queryClient.invalidateQueries({
          queryKey: chapterKeys.list(ebookId, { page, limit })
        });
        
        // Verificar se payload.new existe e tem uma propriedade id
        const newData = payload.new as Record<string, any> | undefined;
        if (newData && typeof newData.id === 'string') {
          queryClient.invalidateQueries({
            queryKey: chapterKeys.detail(newData.id)
          });
        }
      })
      .subscribe();

    // Limpar a inscrição quando o componente for desmontado
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [ebookId, page, limit, queryClient]);

  return {
    chapters: data?.chapters || [],
    total: data?.total || 0,
    isLoading,
    isFetching,
    isUpdating,
    error: error?.message,
    page,
    limit,
    setPage,
    setLimit,
    refetch,
    updateChapter: (id: string, updates: Partial<Chapter>) => updateChapter({ id, updates }),
    
    // Helpers para paginação
    hasNextPage: data ? page * limit < data.total : false,
    hasPreviousPage: page > 1,
    totalPages: data ? Math.ceil(data.total / limit) : 0,
    nextPage: () => setPage(old => (old * limit < (data?.total || 0)) ? old + 1 : old),
    previousPage: () => setPage(old => (old > 1) ? old - 1 : old),
  };
} 