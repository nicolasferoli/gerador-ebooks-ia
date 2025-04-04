import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { 
  generateTableOfContents,
  generateEbookChapter,
  generateCoverImage 
} from '../../../../lib/openai';
import { rateLimit } from '../../../../lib/rate-limit';

export async function POST(
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
    
    // Verificar rate limit (2 gerações por hora)
    const identifier = `user_${userId}_generate_ebook`;
    const { success, limit, remaining, reset } = await rateLimit(identifier, 2);
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Limite de geração de e-books excedido. Tente novamente mais tarde.',
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
    
    // Buscar informações do e-book
    const { data: ebook, error: ebookError } = await supabase
      .from('ebooks')
      .select('*')
      .eq('id', ebookId)
      .eq('user_id', userId)
      .single();
      
    if (ebookError || !ebook) {
      console.error('Erro ao buscar e-book:', ebookError);
      return NextResponse.json(
        { error: 'E-book não encontrado ou acesso negado.' },
        { status: 404 }
      );
    }
    
    // Verificar se o e-book já está em processo de geração
    if (ebook.status !== 'draft' && ebook.status !== 'failed') {
      return NextResponse.json(
        { error: 'Este e-book já está em processo de geração ou foi concluído.' },
        { status: 400 }
      );
    }
    
    // Atualizar status para geração de sumário
    await supabase
      .from('ebooks')
      .update({ 
        status: 'generating_toc', 
        progress: 5,
        updated_at: new Date().toISOString()
      })
      .eq('id', ebookId);
    
    // Passo 1: Gerar sumário
    const chapterTitles = await generateTableOfContents(ebook.title, ebook.description);
    
    // Atualizar e-book com o sumário gerado
    await supabase
      .from('ebooks')
      .update({ 
        status: 'generating_chapters', 
        progress: 10,
        toc_generated: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', ebookId);
    
    // Criar registros para cada capítulo
    const chaptersToInsert = chapterTitles.map((title, index) => ({
      ebook_id: ebookId,
      number: index + 1,
      title,
      content: '',
      status: 'pending',
    }));
    
    const { error: chaptersError } = await supabase
      .from('chapters')
      .insert(chaptersToInsert);
    
    if (chaptersError) {
      console.error('Erro ao criar capítulos:', chaptersError);
      
      // Atualizar status para falha
      await supabase
        .from('ebooks')
        .update({ 
          status: 'failed', 
          progress: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', ebookId);
      
      return NextResponse.json(
        { error: 'Erro ao criar estrutura de capítulos.' },
        { status: 500 }
      );
    }
    
    // Passo 2: Iniciar geração de capítulos
    // Buscar capítulos criados para processamento
    const { data: chapters } = await supabase
      .from('chapters')
      .select('*')
      .eq('ebook_id', ebookId)
      .order('number', { ascending: true });
    
    if (!chapters || chapters.length === 0) {
      await supabase
        .from('ebooks')
        .update({ 
          status: 'failed', 
          progress: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', ebookId);
      
      return NextResponse.json(
        { error: 'Erro ao buscar capítulos para processamento.' },
        { status: 500 }
      );
    }
    
    // Atualizar progresso antes de iniciar a geração de capítulos
    await supabase
      .from('ebooks')
      .update({ 
        progress: 15,
        updated_at: new Date().toISOString()
      })
      .eq('id', ebookId);
    
    // Processar capítulos sequencialmente
    let previousChapterContent = '';
    const totalChapters = chapters.length;
    
    for (let i = 0; i < totalChapters; i++) {
      const chapter = chapters[i];
      const progressPerChapter = 70 / totalChapters; // 70% do progresso é para os capítulos
      const currentProgress = 15 + (progressPerChapter * i);
      
      // Atualizar status do capítulo para "gerando"
      await supabase
        .from('chapters')
        .update({ 
          status: 'generating',
          updated_at: new Date().toISOString()
        })
        .eq('id', chapter.id);
      
      // Atualizar progresso do e-book
      await supabase
        .from('ebooks')
        .update({ 
          progress: Math.round(currentProgress),
          updated_at: new Date().toISOString()
        })
        .eq('id', ebookId);
      
      try {
        // Gerar conteúdo do capítulo
        const chapterContent = await generateEbookChapter(
          ebook.title,
          ebook.description,
          chapter.title,
          previousChapterContent
        );
        
        // Atualizar capítulo com o conteúdo gerado
        await supabase
          .from('chapters')
          .update({ 
            content: chapterContent,
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', chapter.id);
        
        previousChapterContent = chapterContent;
      } catch (error) {
        console.error(`Erro ao gerar capítulo ${chapter.number}:`, error);
        
        // Marcar capítulo como falha
        await supabase
          .from('chapters')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', chapter.id);
        
        // Continuar com o próximo capítulo
      }
    }
    
    // Passo 3: Gerar capa
    await supabase
      .from('ebooks')
      .update({ 
        status: 'generating_cover', 
        progress: 85,
        updated_at: new Date().toISOString()
      })
      .eq('id', ebookId);
    
    try {
      // Gerar imagem de capa
      const coverImageUrl = await generateCoverImage(ebook.title, ebook.description);
      
      // Atualizar e-book com a URL da capa
      await supabase
        .from('ebooks')
        .update({ 
          cover_image_url: coverImageUrl,
          status: 'completed', 
          progress: 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', ebookId);
    } catch (error) {
      console.error('Erro ao gerar capa:', error);
      
      // Concluir mesmo sem a capa
      await supabase
        .from('ebooks')
        .update({ 
          status: 'completed', 
          progress: 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', ebookId);
    }
    
    // Buscar o e-book atualizado com todos os dados
    const { data: updatedEbook } = await supabase
      .from('ebooks')
      .select(`
        *,
        chapters:chapters(*)
      `)
      .eq('id', ebookId)
      .single();
    
    // Retornar informações do e-book gerado
    return NextResponse.json({
      id: updatedEbook.id,
      title: updatedEbook.title,
      status: updatedEbook.status,
      progress: updatedEbook.progress,
      coverImageUrl: updatedEbook.cover_image_url,
      chaptersCount: updatedEbook.chapters.length,
      message: 'E-book gerado com sucesso!'
    });
    
  } catch (error: any) {
    console.error('Erro ao processar solicitação:', error);
    
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
} 