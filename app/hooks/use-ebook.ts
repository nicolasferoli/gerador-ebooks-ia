import useSWR from 'swr';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Ebook, EbookCreationData } from '../types/ebook';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Erro ao buscar dados');
  }
  
  return response.json();
};

export function useEbook(id?: string) {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar um ebook específico pelo ID
  const { data: ebook, error: fetchError, mutate } = useSWR<Ebook>(
    id ? `/api/ebooks/${id}` : null,
    fetcher
  );

  // Buscar todos os ebooks do usuário
  const { data: ebooks, error: fetchAllError, mutate: mutateAll } = useSWR<Ebook[]>(
    '/api/ebooks',
    fetcher
  );

  const createEbook = async (data: EbookCreationData) => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await fetch('/api/ebooks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar e-book');
      }

      const newEbook = await response.json();
      mutateAll();
      
      return { success: true, data: newEbook };
    } catch (err: any) {
      setError(err.message || 'Erro ao criar e-book. Tente novamente.');
      return { success: false, error: err.message };
    } finally {
      setIsCreating(false);
    }
  };

  const updateEbook = async (id: string, updates: Partial<Ebook>) => {
    try {
      setIsUpdating(true);
      setError(null);

      const { data, error } = await supabase
        .from('ebooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      mutate();
      mutateAll();
      
      return { success: true, data };
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar e-book. Tente novamente.');
      return { success: false, error: err.message };
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteEbook = async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('ebooks')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      mutateAll();
      
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir e-book. Tente novamente.');
      return { success: false, error: err.message };
    }
  };

  const startGeneration = async (id: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/ebooks/${id}/generate-toc`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao iniciar geração');
      }

      mutate();
      
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar geração. Tente novamente.');
      return { success: false, error: err.message };
    }
  };

  return {
    ebook,
    ebooks,
    isLoading: !fetchError && !ebook && !!id,
    isEbooksLoading: !fetchAllError && !ebooks,
    isCreating,
    isUpdating,
    error: error || fetchError?.message || fetchAllError?.message,
    createEbook,
    updateEbook,
    deleteEbook,
    startGeneration,
    mutate,
    mutateAll,
  };
} 