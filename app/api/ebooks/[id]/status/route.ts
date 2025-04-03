import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { rateLimit } from '../../../../lib/rate-limit';

export async function GET(
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
    
    // Verificar rate limit (300 consultas por hora = 5 por minuto)
    const identifier = `user_${userId}_check_status`;
    const { success, limit, remaining, reset } = await rateLimit(identifier, 300, 3600);
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Limite de consultas de status excedido. Tente novamente mais tarde.',
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
      .select(`
        id,
        title,
        description,
        status,
        progress,
        cover_image_url,
        toc_generated,
        created_at,
        updated_at,
        chapters(id, number, title, status)
      `)
      .eq('id', ebookId)
      .eq('user_id', userId)
      .single();
      
    if (ebookError || !ebook) {
      return NextResponse.json(
        { error: 'E-book não encontrado ou acesso não autorizado.' },
        { status: 404 }
      );
    }
    
    // Preparar resposta com status detalhado
    const statusDetail = getStatusDetail(ebook.status, ebook.progress);
    
    return NextResponse.json({
      id: ebook.id,
      title: ebook.title,
      status: ebook.status,
      progress: ebook.progress,
      coverImageUrl: ebook.cover_image_url,
      tocGenerated: ebook.toc_generated,
      statusDetail,
      chapters: ebook.chapters
        .sort((a: any, b: any) => a.number - b.number)
        .map((chapter: any) => ({
          id: chapter.id,
          number: chapter.number,
          title: chapter.title,
          status: chapter.status
        })),
      createdAt: ebook.created_at,
      updatedAt: ebook.updated_at
    });
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

// Função auxiliar para obter detalhes do status
function getStatusDetail(status: string, progress: number): string {
  switch (status) {
    case 'initializing':
      return 'Inicializando e-book';
    case 'draft':
      return 'E-book em rascunho';
    case 'generating_toc':
      return 'Gerando sumário do e-book';
    case 'generating_chapters':
      return `Gerando capítulos (${progress}% concluído)`;
    case 'generating_cover':
      return 'Gerando capa do e-book';
    case 'completed':
      return 'E-book concluído';
    case 'failed':
      return 'Falha na geração do e-book';
    default:
      return 'Status desconhecido';
  }
} 