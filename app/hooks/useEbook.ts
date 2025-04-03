'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ebookApi } from './api';
import { Ebook, EbookCreationData } from '../types/ebook';

// Chaves de consulta para facilitar a invalidação de cache
export const ebookKeys = {
  all: ['ebooks'] as const,
  lists: () => [...ebookKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...ebookKeys.lists(), filters] as const,
  details: () => [...ebookKeys.all, 'detail'] as const,
  detail: (id: string) => [...ebookKeys.details(), id] as const,
};

export function useEbook(id?: string) {
  const queryClient = useQueryClient();

  // Buscar um ebook específico pelo ID
  const { data: ebook, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: id ? ebookKeys.detail(id) : ['ebooks', 'detail', 'placeholder'],
    queryFn: () => id ? ebookApi.getEbook(id) : null,
    enabled: !!id,
  });

  // Buscar todos os ebooks do usuário
  const { data: ebooks = [], isLoading: isLoadingList, error: listError } = useQuery({
    queryKey: ebookKeys.lists(),
    queryFn: ebookApi.getUserEbooks,
    enabled: !id, // Só carregar a lista quando não estiver carregando um ebook específico
  });

  // Criar um novo ebook
  const { mutateAsync: createEbook, isPending: isCreating } = useMutation({
    mutationFn: (data: EbookCreationData) => ebookApi.createEbook(data),
    onSuccess: (newEbook) => {
      // Atualizar o cache após a criação bem-sucedida
      queryClient.invalidateQueries({ queryKey: ebookKeys.lists() });
    },
  });

  // Atualizar um ebook
  const { mutateAsync: updateEbook, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Ebook> }) => 
      ebookApi.updateEbook(id, updates),
    onSuccess: (updatedEbook) => {
      // Atualizar o cache após a atualização bem-sucedida
      queryClient.invalidateQueries({ queryKey: ebookKeys.detail(updatedEbook.id) });
      queryClient.invalidateQueries({ queryKey: ebookKeys.lists() });
    },
  });

  // Excluir um ebook
  const { mutateAsync: deleteEbook, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => ebookApi.deleteEbook(id),
    onSuccess: (_, deletedId) => {
      // Atualizar o cache após a exclusão bem-sucedida
      queryClient.invalidateQueries({ queryKey: ebookKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: ebookKeys.lists() });
    },
  });

  return {
    // Dados
    ebook,
    ebooks,
    
    // Estados
    isLoading: isLoading || isLoadingList,
    isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Erros
    error: error?.message,
    listError: listError?.message,
    
    // Ações
    createEbook,
    updateEbook: (id: string, updates: Partial<Ebook>) => updateEbook({ id, updates }),
    deleteEbook,
    refetch,
  };
} 