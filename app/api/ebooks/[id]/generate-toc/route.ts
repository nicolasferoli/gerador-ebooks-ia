import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { generateTableOfContents } from '../../../../lib/openai';

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
    
    // Verificar se já existe um processo de geração em andamento
    if (
      ebook.status === 'generating_toc' || 
      ebook.status === 'generating_chapters' || 
      ebook.status === 'generating_cover'
    ) {
      return NextResponse.json(
        { 
          message: 'Já existe um processo de geração em andamento para este e-book.',
          status: ebook.status,
          progress: ebook.progress
        },
        { status: 200 }
      );
    }
    
    // Atualizar status do e-book para 'generating_toc'
    await supabase
      .from('ebooks')
      .update({
        status: 'generating_toc',
        progress: 0
      })
      .eq('id', ebookId);
      
    // Iniciar processo de geração assíncrono
    // Na prática, isso seria melhor feito em um worker ou fila de tarefas
    generateTOC(ebookId, ebook.title, ebook.description, supabase).catch(console.error);
    
    return NextResponse.json({
      message: 'Geração de sumário iniciada com sucesso.',
      status: 'generating_toc',
      progress: 0
    });
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

// Função para geração assíncrona do sumário
async function generateTOC(
  ebookId: string, 
  title: string, 
  description: string, 
  supabase: any
) {
  try {
    // Gerar sumário usando OpenAI
    const chapterTitles = await generateTableOfContents(title, description);
    
    // Criar capítulos no banco de dados
    const chapters = chapterTitles.map((title, index) => ({
      ebook_id: ebookId,
      title,
      number: index + 1,
      content: '',
      status: 'pending',
    }));
    
    const { error: chaptersError } = await supabase
      .from('chapters')
      .insert(chapters);
      
    if (chaptersError) {
      throw chaptersError;
    }
    
    // Atualizar status do e-book
    await supabase
      .from('ebooks')
      .update({
        status: 'generating_chapters',
        progress: 0,
        toc_generated: true
      })
      .eq('id', ebookId);
      
    // Iniciar processo de geração de capítulos
    // Na prática, isso seria melhor feito em um worker ou fila de tarefas
    startChapterGeneration(ebookId, supabase).catch(console.error);
  } catch (error) {
    console.error('Erro na geração de sumário:', error);
    
    // Atualizar status do e-book em caso de falha
    await supabase
      .from('ebooks')
      .update({
        status: 'failed',
        progress: 0,
      })
      .eq('id', ebookId);
  }
}

// Função para iniciar geração de capítulos
async function startChapterGeneration(ebookId: string, supabase: any) {
  try {
    // Obter todos os capítulos do e-book
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('ebook_id', ebookId)
      .order('number', { ascending: true });
      
    if (chaptersError || !chapters || chapters.length === 0) {
      throw new Error('Erro ao obter capítulos ou nenhum capítulo encontrado');
    }
    
    // Gerar primeiro capítulo - Na prática, isso seria um endpoint separado
    // que seria chamado para cada capítulo, possivelmente em paralelo com limites
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ebooks/${ebookId}/generate-chapter/1`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Erro ao iniciar geração de capítulos:', error);
    
    // Atualizar status do e-book em caso de falha
    await supabase
      .from('ebooks')
      .update({
        status: 'failed',
        progress: 0,
      })
      .eq('id', ebookId);
  }
} 