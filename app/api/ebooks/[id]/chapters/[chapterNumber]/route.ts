import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(
  request: Request,
  { params }: { params: { id: string, chapterNumber: string } }
) {
  try {
    const ebookId = params.id;
    const chapterNumber = parseInt(params.chapterNumber);
    
    if (!ebookId) {
      return NextResponse.json(
        { error: 'ID do e-book não fornecido' },
        { status: 400 }
      );
    }
    
    if (isNaN(chapterNumber)) {
      return NextResponse.json(
        { error: 'Número do capítulo inválido' },
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
    
    // Primeiro, verificar se o usuário tem acesso ao e-book
    const { data: ebook, error: ebookError } = await supabase
      .from('ebooks')
      .select('user_id')
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
    
    // Buscar informações do capítulo
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('ebook_id', ebookId)
      .eq('number', chapterNumber)
      .single();
      
    if (chapterError || !chapter) {
      console.error('Erro ao buscar capítulo:', chapterError);
      return NextResponse.json(
        { error: 'Capítulo não encontrado.' },
        { status: 404 }
      );
    }
    
    // Retornar informações do capítulo
    return NextResponse.json({
      id: chapter.id,
      ebookId: chapter.ebook_id,
      number: chapter.number,
      title: chapter.title,
      content: chapter.content,
      status: chapter.status,
      createdAt: chapter.created_at,
      updatedAt: chapter.updated_at
    });
    
  } catch (error: any) {
    console.error('Erro ao processar solicitação:', error);
    
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
} 