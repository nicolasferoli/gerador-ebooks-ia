import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { generateEbookTitle } from '../../../lib/openai';
import { rateLimit } from '../../../lib/rate-limit';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { title, description, templateId } = requestData;

    // Verificar se os campos obrigatórios foram fornecidos
    if (!description) {
      return NextResponse.json(
        { error: 'A descrição é obrigatória' },
        { status: 400 }
      );
    }

    // Inicializar cliente do Supabase
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Verificar rate limit (5 ebooks por hora)
    const identifier = `user_${userId}_create_ebook`;
    const { success, limit, remaining, reset } = await rateLimit(identifier, 5);
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Limite de criação de e-books excedido. Tente novamente mais tarde.',
          limit,
          remaining,
          reset: new Date(reset).toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        }
      );
    }
    
    // Verificar créditos do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();
      
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Erro ao verificar perfil do usuário.' },
        { status: 500 }
      );
    }
    
    if (profile.credits < 1) {
      return NextResponse.json(
        { error: 'Créditos insuficientes para gerar um novo e-book.' },
        { status: 400 }
      );
    }
    
    // Gerar título se não fornecido
    let finalTitle = title;
    if (!finalTitle) {
      finalTitle = await generateEbookTitle(description);
    }
    
    // Criar novo e-book com status "initializing"
    const { data: ebook, error: ebookError } = await supabase
      .from('ebooks')
      .insert({
        user_id: userId,
        title: finalTitle,
        description,
        template_id: templateId || null,
        status: 'initializing',
        progress: 0,
        toc_generated: false,
      })
      .select()
      .single();
      
    if (ebookError) {
      console.error('Erro ao criar e-book:', ebookError);
      return NextResponse.json(
        { error: 'Erro ao criar e-book.' },
        { status: 500 }
      );
    }
    
    // Deduzir um crédito do usuário
    await supabase
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', userId);
    
    // Retornar apenas o ID e informações essenciais do ebook
    return NextResponse.json({
      id: ebook.id,
      title: ebook.title,
      status: ebook.status,
      message: 'E-book criado com sucesso. Agora você pode gerar o sumário.'
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
} 