import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { generateEbookChapter } from '../../../../../lib/openai';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; number: string } }
) {
  try {
    const ebookId = params.id;
    const chapterNumber = parseInt(params.number, 10);

    if (!ebookId || isNaN(chapterNumber)) {
      return NextResponse.json(
        { error: 'ID do e-book e número do capítulo válidos são obrigatórios' },
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
    
    // Obter dados do e-book
    const { data: ebook, error: ebookError } = await supabase
      .from('ebooks')
      .select('*')
      .eq('id', ebookId)
      .eq('user_id', session.user.id)
      .single();
      
    if (ebookError || !ebook) {
      return NextResponse.json(
        { error: 'E-book não encontrado ou acesso não autorizado.' },
        { status: 404 }
      );
    }
    
    // Verificar se o e-book está em processo de geração de capítulos
    if (ebook.status !== 'generating_chapters') {
      return NextResponse.json(
        { error: 'O e-book não está em processo de geração de capítulos.' },
        { status: 400 }
      );
    }
    
    // Obter o capítulo atual
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('ebook_id', ebookId)
      .eq('number', chapterNumber)
      .single();
      
    if (chapterError || !chapter) {
      return NextResponse.json(
        { error: 'Capítulo não encontrado.' },
        { status: 404 }
      );
    }
    
    // Verificar se o capítulo já foi gerado
    if (chapter.status === 'completed') {
      return NextResponse.json(
        { message: 'Este capítulo já foi gerado.' },
        { status: 200 }
      );
    }
    
    // Atualizar status do capítulo
    await supabase
      .from('chapters')
      .update({ status: 'generating' })
      .eq('id', chapter.id);
      
    // Iniciar processo de geração assíncrono
    generateChapter(ebookId, chapterNumber, supabase).catch(console.error);
    
    return NextResponse.json({
      message: `Geração do capítulo ${chapterNumber} iniciada com sucesso.`,
      chapterId: chapter.id
    });
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

// Função para geração assíncrona do capítulo
async function generateChapter(
  ebookId: string,
  chapterNumber: number,
  supabase: any
) {
  try {
    // Obter dados do e-book
    const { data: ebook, error: ebookError } = await supabase
      .from('ebooks')
      .select('*')
      .eq('id', ebookId)
      .single();
      
    if (ebookError || !ebook) {
      throw new Error('E-book não encontrado');
    }
    
    // Obter capítulo atual
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('ebook_id', ebookId)
      .eq('number', chapterNumber)
      .single();
      
    if (chapterError || !chapter) {
      throw new Error('Capítulo não encontrado');
    }
    
    // Obter capítulo anterior para continuidade (se não for o primeiro)
    let previousChapterContent: string | undefined;
    
    if (chapterNumber > 1) {
      const { data: prevChapter, error: prevChapterError } = await supabase
        .from('chapters')
        .select('content')
        .eq('ebook_id', ebookId)
        .eq('number', chapterNumber - 1)
        .single();
        
      if (!prevChapterError && prevChapter) {
        previousChapterContent = prevChapter.content;
      }
    }
    
    // Gerar conteúdo do capítulo
    const content = await generateEbookChapter(
      ebook.title,
      ebook.description,
      chapter.title,
      previousChapterContent
    );
    
    // Atualizar capítulo com o conteúdo gerado
    await supabase
      .from('chapters')
      .update({
        content,
        status: 'completed'
      })
      .eq('id', chapter.id);
    
    // Obter total de capítulos
    const { data: chaptersCount, error: countError } = await supabase
      .from('chapters')
      .select('id', { count: 'exact' })
      .eq('ebook_id', ebookId);
      
    if (countError) {
      throw countError;
    }
    
    // Calcular progresso
    const totalChapters = chaptersCount.length;
    const progress = Math.round((chapterNumber / totalChapters) * 100);
    
    // Atualizar progresso do e-book
    await supabase
      .from('ebooks')
      .update({ progress })
      .eq('id', ebookId);
    
    // Se for o último capítulo, atualizar status
    if (chapterNumber === totalChapters) {
      await supabase
        .from('ebooks')
        .update({
          status: 'generating_cover'
        })
        .eq('id', ebookId);
        
      // Iniciar geração da capa
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ebooks/${ebookId}/generate-cover`, {
        method: 'POST'
      });
    } else {
      // Se não for o último, iniciar geração do próximo capítulo
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ebooks/${ebookId}/generate-chapter/${chapterNumber + 1}`, {
        method: 'POST'
      });
    }
  } catch (error) {
    console.error(`Erro na geração do capítulo ${chapterNumber}:`, error);
    
    // Atualizar status do capítulo em caso de falha
    await supabase
      .from('chapters')
      .update({
        status: 'failed'
      })
      .eq('ebook_id', ebookId)
      .eq('number', chapterNumber);
      
    // Atualizar status do e-book em caso de falha
    await supabase
      .from('ebooks')
      .update({
        status: 'failed'
      })
      .eq('id', ebookId);
  }
} 