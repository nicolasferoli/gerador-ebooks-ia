'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { userApi } from './api';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '../types/user';

// Chaves de consulta
export const userKeys = {
  all: ['user'] as const,
  current: () => [...userKeys.all, 'current'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  subscription: () => [...userKeys.all, 'subscription'] as const,
};

export function useUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Buscar dados do usuário atual
  const {
    data: user,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: userKeys.current(),
    queryFn: () => userApi.getCurrentUser(),
    retry: 1, // Menor número de tentativas para falha de autenticação
    // Se o usuário não estiver autenticado, retornará erro rapidamente
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Login
  const { mutateAsync: login, isPending: isLoggingIn } = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      // Atualizar o cache após o login bem-sucedido
      refetch();
      router.refresh();
    },
  });

  // Registro
  const { mutateAsync: register, isPending: isRegistering } = useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      // Atualizar o cache após o registro bem-sucedido
      refetch();
      router.refresh();
    },
  });

  // Logout
  const { mutateAsync: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      // Limpar o cache após o logout
      queryClient.clear();
      router.push('/login');
      router.refresh();
    },
  });

  // Atualizar perfil
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.fullName,
          avatar_url: updates.avatarUrl,
          // Outros campos que podem ser atualizados
        })
        .eq('id', user.id);
      
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      // Atualizar o cache após atualização bem-sucedida
      queryClient.invalidateQueries({ queryKey: userKeys.current() });
    },
  });

  // Ouvir mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Revalidar o usuário atual no cache
          queryClient.invalidateQueries({ queryKey: userKeys.current() });
        } else if (event === 'SIGNED_OUT') {
          // Limpar o cache quando o usuário fizer logout
          queryClient.setQueryData(userKeys.current(), null);
        }
      }
    );

    // Limpar a inscrição quando o componente for desmontado
    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Configurar Supabase Realtime para atualizações do perfil do usuário
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel(`profile-updates-${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`,
      }, () => {
        // Invalidar o cache do usuário quando o perfil for atualizado
        queryClient.invalidateQueries({ queryKey: userKeys.current() });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, queryClient]);

  return {
    user,
    isLoading,
    isLoggingIn,
    isRegistering,
    isLoggingOut,
    isUpdatingProfile,
    error: error?.message,
    
    // Métodos de autenticação
    login,
    register, 
    logout,
    updateProfile,
    
    // Dados do usuário
    isAuthenticated: !!user,
    subscription: user?.subscription,
    isPremium: user?.subscription?.plan === 'premium',
    credits: user?.credits || 0,
    
    // Recarregar dados
    refetch,
  };
} 