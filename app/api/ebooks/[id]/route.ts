import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ebookId = params.id;
    
    if (!ebookId) {
      return NextResponse.json(
        { error: 'ID do e-book não fornecido' },
        { status: 400 }
      );
    }
    
    // Inicializar cliente do Supabase
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Buscar informações do e-book
    const { data: ebook, error: ebookError } = await supabase
      .from('ebooks')
      .select(`
        *,
        chapters:chapters(*)
      `)
      .eq('id', ebookId)
      .single();
      
    if (ebookError || !ebook) {
      console.error('Erro ao buscar e-book:', ebookError);
      return NextResponse.json(
        { error: 'E-book não encontrado.' },
        { status: 404 }
      );
    }
    
    // Verificar permissão de acesso
    if (ebook.user_id !== userId) {
      return NextResponse.json(
        { error: 'Acesso negado a este e-book.' },
        { status: 403 }
      );
    }
    
    // Calcular informações adicionais
    const completedChapters = ebook.chapters.filter(
      (chapter: any) => chapter.status === 'completed'
    ).length;
    
    const currentChapter = ebook.chapters.findIndex(
      (chapter: any) => chapter.status === 'generating'
    ) + 1;
    
    // Formatar resposta
    return NextResponse.json({
      id: ebook.id,
      title: ebook.title,
      description: ebook.description,
      status: ebook.status,
      progress: ebook.progress,
      coverImageUrl: ebook.cover_image_url,
      chaptersCount: ebook.chapters.length,
      completedChapters,
      currentChapter: currentChapter || 0,
      createdAt: ebook.created_at,
      updatedAt: ebook.updated_at
    });
    
  } catch (error: any) {
    console.error('Erro ao processar solicitação:', error);
    
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
} 