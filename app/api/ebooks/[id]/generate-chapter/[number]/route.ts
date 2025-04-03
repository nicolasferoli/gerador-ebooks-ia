import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { generateEbookChapter } from '../../../../../lib/openai';
import { rateLimit } from '../../../../../lib/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; number: string } }
) {
  try {
    const ebookId = params.id;
    const chapterNumber = parseInt(params.number, 10);

    if (!ebookId || isNaN(chapterNumber) || chapterNumber < 1) {
      return NextResponse.json(
        { error: 'ID do e-book e número de capítulo são obrigatórios' },
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
    
    // Verificar rate limit (30 gerações de capítulos por dia)
    const identifier = `user_${userId}_generate_chapter`;
    const { success, limit, remaining, reset } = await rateLimit(identifier, 30, 24 * 60 * 60);
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Limite de geração de capítulos excedido. Tente novamente mais tarde.',
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
    
    // Verificar se o e-book está no estado correto para gerar capítulos
    if (ebook.status !== 'generating_chapters') {
      return NextResponse.json(
        { 
          error: 'O e-book não está no estado correto para geração de capítulos.',
          status: ebook.status 
        },
        { status: 400 }
      );
    }
    
    // Obter dados do capítulo
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
        { 
          message: 'Este capítulo já foi gerado.',
          chapter 
        },
        { status: 200 }
      );
    }
    
    // Verificar se o capítulo já está sendo gerado
    if (chapter.status === 'generating') {
      return NextResponse.json(
        { 
          message: 'Este capítulo já está em processo de geração.' 
        },
        { status: 200 }
      );
    }
    
    // Obter o capítulo anterior, se existir
    let previousChapterContent: string | undefined = undefined;
    if (chapterNumber > 1) {
      const { data: previousChapter } = await supabase
        .from('chapters')
        .select('content')
        .eq('ebook_id', ebookId)
        .eq('number', chapterNumber - 1)
        .single();
        
      if (previousChapter && previousChapter.content) {
        previousChapterContent = previousChapter.content;
      }
    }
    
    // Atualizar status do capítulo para 'generating'
    await supabase
      .from('chapters')
      .update({
        status: 'generating',
      })
      .eq('id', chapter.id);
      
    // Criar um AbortController para limitar o tempo de geração
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutos
    
    try {
      // Gerar conteúdo do capítulo
      const content = await generateEbookChapter(
        ebook.title,
        ebook.description,
        chapter.title,
        previousChapterContent,
        { signal: controller.signal, model: 'gpt-4o-mini' }
      );
      
      clearTimeout(timeoutId);
      
      // Atualizar o capítulo com o conteúdo gerado
      await supabase
        .from('chapters')
        .update({
          content,
          status: 'completed',
        })
        .eq('id', chapter.id);
        
      // Atualizar o progresso do e-book
      const { data: totalChapters } = await supabase
        .from('chapters')
        .select('id', { count: 'exact' })
        .eq('ebook_id', ebookId);
        
      const { data: completedChapters } = await supabase
        .from('chapters')
        .select('id', { count: 'exact' })
        .eq('ebook_id', ebookId)
        .eq('status', 'completed');
        
      const totalCount = totalChapters?.length || 0;
      const completedCount = completedChapters?.length || 0;
      
      const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      // Se todos os capítulos foram concluídos, mudar o status para 'generating_cover'
      const newStatus = progress === 100 ? 'generating_cover' : 'generating_chapters';
      
      await supabase
        .from('ebooks')
        .update({
          status: newStatus,
          progress,
        })
        .eq('id', ebookId);
        
      return NextResponse.json({
        message: 'Capítulo gerado com sucesso',
        chapter: { ...chapter, content, status: 'completed' },
        progress,
        ebook_status: newStatus
      });
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      console.error('Erro ao gerar capítulo:', error);
      
      // Verificar se foi um erro de timeout
      if (error.name === 'AbortError') {
        // Atualizar status do capítulo para 'failed'
        await supabase
          .from('chapters')
          .update({
            status: 'failed',
          })
          .eq('id', chapter.id);
          
        return NextResponse.json(
          { error: 'Tempo limite excedido ao gerar o capítulo.' },
          { status: 408 }
        );
      }
      
      // Outros erros
      await supabase
        .from('chapters')
        .update({
          status: 'failed',
        })
        .eq('id', chapter.id);
        
      return NextResponse.json(
        { error: 'Erro ao gerar capítulo.' },
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