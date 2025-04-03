import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { generateCoverImage } from '../../../../lib/openai';
import { rateLimit } from '../../../../lib/rate-limit';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ebookId = params.id;

    if (!ebookId) {
      return NextResponse.json(
        { error: 'ID do e-book é obrigatório' },
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
    
    // Verificar rate limit (10 gerações de capas por dia)
    const identifier = `user_${userId}_generate_cover`;
    const { success, limit, remaining, reset } = await rateLimit(identifier, 10, 24 * 60 * 60);
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Limite de geração de capas excedido. Tente novamente mais tarde.',
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
    
    // Obter dados do e-book
    const { data: ebook, error: ebookError } = await supabase
      .from('ebooks')
      .select('*')
      .eq('id', ebookId)
      .eq('user_id', userId)
      .single();
      
    if (ebookError || !ebook) {
      return NextResponse.json(
        { error: 'E-book não encontrado ou acesso não autorizado.' },
        { status: 404 }
      );
    }
    
    // Verificar se o e-book está no estado correto para gerar a capa
    if (ebook.status !== 'generating_cover') {
      return NextResponse.json(
        { 
          error: 'O e-book não está no estado correto para geração de capa.',
          status: ebook.status 
        },
        { status: 400 }
      );
    }
    
    // Verificar se já existe uma capa
    if (ebook.cover_image_url) {
      return NextResponse.json(
        { 
          message: 'Este e-book já possui uma capa.',
          coverImageUrl: ebook.cover_image_url 
        },
        { status: 200 }
      );
    }

    // Criar um AbortController para limitar o tempo de geração
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutos
    
    try {
      // Gerar capa com DALL-E 3
      const coverImageUrl = await generateCoverImage(
        ebook.title,
        ebook.description,
        { signal: controller.signal, size: "1024x1792" } // Formato de livro
      );
      
      clearTimeout(timeoutId);
      
      // Atualizar o e-book com a URL da capa
      await supabase
        .from('ebooks')
        .update({
          cover_image_url: coverImageUrl,
          status: 'completed',
          progress: 100
        })
        .eq('id', ebookId);
        
      return NextResponse.json({
        message: 'Capa gerada com sucesso',
        coverImageUrl,
        status: 'completed'
      });
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      console.error('Erro ao gerar capa:', error);
      
      // Verificar se foi um erro de timeout
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Tempo limite excedido ao gerar a capa.' },
          { status: 408 }
        );
      }
      
      // Outros erros
      return NextResponse.json(
        { error: 'Erro ao gerar capa do e-book.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
} 