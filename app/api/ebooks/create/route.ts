import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { generateEbookTitle } from '../../../lib/openai';

// Para armazenar logs de depuração
const debugLogs: any[] = [];

// Verificar se é ambiente de desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview';

export async function POST(request: Request) {
  try {
    debugLogs.push({ step: 'start', timestamp: new Date().toISOString() });
    
    // Verificar o corpo da requisição
    let requestData;
    try {
      requestData = await request.json();
      debugLogs.push({ 
        step: 'request_parsed', 
        data: JSON.stringify(requestData), 
        timestamp: new Date().toISOString() 
      });
    } catch (parseError) {
      console.error('Erro ao processar corpo da requisição:', parseError);
      debugLogs.push({ 
        step: 'request_parse_error', 
        error: parseError instanceof Error ? parseError.message : String(parseError),
        timestamp: new Date().toISOString() 
      });
      
      return NextResponse.json(
        { 
          error: 'Erro ao processar corpo da requisição', 
          debug: isDevelopment ? debugLogs : undefined 
        },
        { status: 400 }
      );
    }
    
    const { title, description, templateId } = requestData;

    // Verificar se os campos obrigatórios foram fornecidos
    if (!description) {
      debugLogs.push({ 
        step: 'validation_error', 
        error: 'Descrição obrigatória',
        timestamp: new Date().toISOString() 
      });
      
      return NextResponse.json(
        { 
          error: 'A descrição é obrigatória',
          debug: isDevelopment ? debugLogs : undefined 
        },
        { status: 400 }
      );
    }

    // Inicializar cliente do Supabase
    debugLogs.push({ step: 'initializing_supabase', timestamp: new Date().toISOString() });
    let supabase;
    
    try {
      const cookieStore = cookies();
      supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      debugLogs.push({ step: 'supabase_initialized', timestamp: new Date().toISOString() });
    } catch (supabaseInitError) {
      console.error('Erro ao inicializar Supabase:', supabaseInitError);
      debugLogs.push({ 
        step: 'supabase_init_error', 
        error: supabaseInitError instanceof Error ? supabaseInitError.message : String(supabaseInitError),
        timestamp: new Date().toISOString() 
      });
      
      return NextResponse.json(
        { 
          error: 'Erro ao conectar ao banco de dados', 
          debug: isDevelopment ? debugLogs : undefined 
        },
        { status: 500 }
      );
    }
    
    // Verificar autenticação de forma simplificada
    let userId = 'anonymous-user';
    debugLogs.push({ step: 'checking_auth', timestamp: new Date().toISOString() });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        userId = session.user.id;
        debugLogs.push({ 
          step: 'auth_success', 
          userId,
          timestamp: new Date().toISOString() 
        });
      } else if (isDevelopment) {
        // Para ambiente de desenvolvimento, permitir acesso sem login
        userId = "dev-user-" + Date.now();
        debugLogs.push({ 
          step: 'dev_auth', 
          userId,
          timestamp: new Date().toISOString() 
        });
      } else {
        debugLogs.push({ 
          step: 'auth_failed', 
          timestamp: new Date().toISOString() 
        });
        
        return NextResponse.json(
          { 
            error: 'Não autorizado. Faça login para continuar.',
            debug: isDevelopment ? debugLogs : undefined 
          },
          { status: 401 }
        );
      }
    } catch (authError) {
      console.error('Erro ao verificar autenticação:', authError);
      debugLogs.push({ 
        step: 'auth_error', 
        error: authError instanceof Error ? authError.message : String(authError),
        timestamp: new Date().toISOString() 
      });
      
      // Para ambiente de desenvolvimento, permitir acesso sem login
      if (isDevelopment) {
        userId = "dev-user-" + Date.now();
        debugLogs.push({ 
          step: 'dev_auth_fallback', 
          userId,
          timestamp: new Date().toISOString() 
        });
      } else {
        return NextResponse.json(
          { 
            error: 'Erro ao verificar autenticação.',
            debug: isDevelopment ? debugLogs : undefined 
          },
          { status: 500 }
        );
      }
    }
    
    // Gerar título se não fornecido
    let finalTitle = title;
    debugLogs.push({ 
      step: 'title_check', 
      hasTitle: !!title,
      timestamp: new Date().toISOString() 
    });
    
    if (!finalTitle) {
      try {
        debugLogs.push({ step: 'generating_title', timestamp: new Date().toISOString() });
        finalTitle = await generateEbookTitle(description);
        debugLogs.push({ 
          step: 'title_generated', 
          title: finalTitle,
          timestamp: new Date().toISOString() 
        });
      } catch (titleError) {
        console.error('Erro ao gerar título:', titleError);
        debugLogs.push({ 
          step: 'title_generation_error', 
          error: titleError instanceof Error ? titleError.message : String(titleError),
          timestamp: new Date().toISOString() 
        });
        
        // Fallback para título padrão
        finalTitle = 'Novo E-book ' + new Date().toLocaleString();
        debugLogs.push({ 
          step: 'using_fallback_title', 
          title: finalTitle,
          timestamp: new Date().toISOString() 
        });
      }
    }
    
    // Criar novo e-book com status "draft"
    let ebook;
    debugLogs.push({ 
      step: 'creating_ebook', 
      userData: { userId, title: finalTitle, templateId },
      timestamp: new Date().toISOString() 
    });
    
    try {
      // Definir dados para inserção
      const ebookData = {
        user_id: userId,
        title: finalTitle,
        description,
        template_id: templateId || null,
        status: 'draft',
        progress: 0,
        toc_generated: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      debugLogs.push({ 
        step: 'insert_data_prepared', 
        data: JSON.stringify(ebookData),
        timestamp: new Date().toISOString() 
      });
      
      const { data, error } = await supabase
        .from('ebooks')
        .insert(ebookData)
        .select()
        .single();
        
      if (error) {
        console.error('Erro do Supabase ao criar e-book:', error);
        debugLogs.push({ 
          step: 'supabase_insert_error', 
          error: JSON.stringify(error),
          timestamp: new Date().toISOString() 
        });
        
        throw error;
      }
      
      if (!data || !data.id) {
        console.error('E-book criado sem retornar ID:', data);
        debugLogs.push({ 
          step: 'ebook_created_no_id', 
          data: JSON.stringify(data),
          timestamp: new Date().toISOString() 
        });
        
        throw new Error('E-book criado sem retornar ID válido');
      }
      
      ebook = data;
      debugLogs.push({ 
        step: 'ebook_created', 
        ebookId: ebook.id,
        timestamp: new Date().toISOString() 
      });
      
      // Verificar status do ebook
      const { data: verifyData, error: verifyError } = await supabase
        .from('ebooks')
        .select('*')
        .eq('id', ebook.id)
        .single();
        
      if (verifyError || !verifyData) {
        console.error('Erro ao verificar e-book criado:', verifyError);
        debugLogs.push({ 
          step: 'verify_ebook_error', 
          error: verifyError ? JSON.stringify(verifyError) : 'Ebook não encontrado após criação',
          timestamp: new Date().toISOString() 
        });
      } else {
        debugLogs.push({ 
          step: 'verify_ebook_success', 
          status: verifyData.status,
          timestamp: new Date().toISOString() 
        });
      }
      
    } catch (ebookError) {
      console.error('Erro ao criar e-book:', ebookError);
      debugLogs.push({ 
        step: 'ebook_creation_error', 
        error: ebookError instanceof Error ? ebookError.message : String(ebookError),
        stack: ebookError instanceof Error ? ebookError.stack : undefined,
        timestamp: new Date().toISOString() 
      });
      
      return NextResponse.json(
        { 
          error: 'Erro ao criar e-book.', 
          details: ebookError instanceof Error ? ebookError.message : String(ebookError),
          debug: isDevelopment ? debugLogs : undefined 
        },
        { status: 500 }
      );
    }
    
    // Retornar apenas o ID e informações essenciais do ebook
    debugLogs.push({ step: 'success', timestamp: new Date().toISOString() });
    
    return NextResponse.json({
      id: ebook.id,
      title: ebook.title,
      status: ebook.status,
      message: 'E-book criado com sucesso. Agora você pode gerar o sumário.',
      debug: isDevelopment ? debugLogs : undefined
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    debugLogs.push({ 
      step: 'unhandled_error', 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString() 
    });
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor.', 
        details: error instanceof Error ? error.message : String(error),
        debug: isDevelopment ? debugLogs : undefined 
      },
      { status: 500 }
    );
  }
} 