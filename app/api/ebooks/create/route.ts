import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { generateEbookTitle } from '../../../lib/openai';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { title, description, templateId, chapterTitles } = requestData;

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
    
    // Criar novo e-book
    const { data: ebook, error: ebookError } = await supabase
      .from('ebooks')
      .insert({
        user_id: userId,
        title: finalTitle,
        description,
        template_id: templateId || null,
        status: 'draft',
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
    
    // Se foram fornecidos títulos de capítulos, criar capítulos
    if (chapterTitles && Array.isArray(chapterTitles) && chapterTitles.length > 0) {
      const chapters = chapterTitles.map((title, index) => ({
        ebook_id: ebook.id,
        title,
        number: index + 1,
        content: '',
        status: 'pending',
      }));
      
      const { error: chaptersError } = await supabase
        .from('chapters')
        .insert(chapters);
        
      if (chaptersError) {
        console.error('Erro ao criar capítulos:', chaptersError);
        // Não falhar a requisição, apenas logar o erro
      } else {
        // Atualizar e-book para indicar que o sumário foi gerado
        await supabase
          .from('ebooks')
          .update({ toc_generated: true })
          .eq('id', ebook.id);
      }
    }
    
    // Deduzir um crédito do usuário
    await supabase
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', userId);
    
    return NextResponse.json(ebook, { status: 201 });
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
} 