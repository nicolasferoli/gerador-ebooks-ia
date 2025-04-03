'use client';

import { supabase } from '../lib/supabase';
import { Ebook, EbookCreationData, Chapter, GenerationProgress } from '../types/ebook';
import { User } from '../types/user';

/**
 * Funções de API para ebooks
 */
export const ebookApi = {
  // Buscar um ebook pelo ID
  async getEbook(id: string): Promise<Ebook> {
    const { data, error } = await supabase
      .from('ebooks')
      .select(`
        *,
        chapters:ebook_chapters(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as Ebook;
  },

  // Buscar todos os ebooks do usuário
  async getUserEbooks(): Promise<Ebook[]> {
    const { data, error } = await supabase
      .from('ebooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as unknown as Ebook[];
  },

  // Criar um novo ebook
  async createEbook(data: EbookCreationData): Promise<Ebook> {
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

    return response.json();
  },

  // Atualizar um ebook
  async updateEbook(id: string, updates: Partial<Ebook>): Promise<Ebook> {
    const { data, error } = await supabase
      .from('ebooks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as Ebook;
  },

  // Excluir um ebook
  async deleteEbook(id: string): Promise<void> {
    const { error } = await supabase
      .from('ebooks')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
};

/**
 * Funções de API para capítulos
 */
export const chaptersApi = {
  // Buscar capítulos de um ebook com paginação
  async getEbookChapters(ebookId: string, page = 1, limit = 10): Promise<{ chapters: Chapter[], total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('ebook_chapters')
      .select('*', { count: 'exact' })
      .eq('ebook_id', ebookId)
      .order('number', { ascending: true })
      .range(from, to);

    if (error) throw new Error(error.message);
    return { 
      chapters: data as unknown as Chapter[], 
      total: count || 0 
    };
  },

  // Buscar um capítulo específico
  async getChapter(id: string): Promise<Chapter> {
    const { data, error } = await supabase
      .from('ebook_chapters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as Chapter;
  },

  // Atualizar um capítulo
  async updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter> {
    const { data, error } = await supabase
      .from('ebook_chapters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as Chapter;
  }
};

/**
 * Funções de API para o status de geração
 */
export const generationApi = {
  // Obter o status atual de geração
  async getGenerationStatus(ebookId: string): Promise<GenerationProgress> {
    const response = await fetch(`/api/ebooks/${ebookId}/status`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar status de geração');
    }
    
    return response.json();
  },

  // Iniciar a geração de um ebook
  async startGeneration(ebookId: string): Promise<void> {
    const response = await fetch(`/api/ebooks/${ebookId}/generate`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao iniciar geração');
    }
  }
};

/**
 * Funções de API para usuários
 */
export const userApi = {
  // Obter dados do usuário atual
  async getCurrentUser(): Promise<User> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw new Error(authError.message);
    if (!user) throw new Error('Usuário não encontrado');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError) throw new Error(profileError.message);
    
    // Combinar dados do auth e profile
    return {
      id: user.id,
      email: user.email as string,
      fullName: profile.full_name || '',
      avatarUrl: profile.avatar_url,
      createdAt: user.created_at,
      updatedAt: profile.updated_at,
      role: profile.role || 'user',
      credits: profile.credits || 0,
      subscription: profile.subscription_data
    };
  }
}; 