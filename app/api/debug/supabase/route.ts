import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Verificar se é ambiente de desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview';

// Lista de tabelas para verificar
const TABLES_TO_CHECK = ['ebooks', 'chapters', 'profiles', 'users'];

/**
 * Endpoint de diagnóstico para Supabase
 * Este endpoint é exclusivo para desenvolvimento e ajuda a identificar 
 * problemas com a conexão do Supabase
 */
export async function GET() {
  // Somente permitir em ambiente de desenvolvimento
  if (!isDevelopment) {
    return NextResponse.json({ error: 'Não disponível em produção' }, { status: 403 });
  }
  
  const results = {
    timestamp: new Date().toISOString(),
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'definido' : 'indefinido',
      anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'definido' : 'indefinido'
    },
    connection: 'pendente',
    tables: {},
    schema: {},
    errors: []
  };
  
  try {
    // Inicializar cliente do Supabase
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Testar conexão com o Supabase
    const { data: testData, error: testError } = await supabase.from('ebooks').select('count(*)');
    
    results.connection = testError ? 'falha' : 'sucesso';
    
    if (testError) {
      results.errors.push({
        step: 'connection_test',
        error: testError.message
      });
    }
    
    // Verificar cada tabela
    for (const table of TABLES_TO_CHECK) {
      try {
        const { data, error } = await supabase.from(table).select('count(*)');
        
        results.tables[table] = {
          exists: !error,
          count: data?.[0]?.count ?? 0,
          error: error ? error.message : null
        };
        
        if (error) {
          results.errors.push({
            step: `table_check_${table}`,
            error: error.message
          });
        }
        
        // Obter esquema da tabela
        if (!error) {
          const { data: schemaData, error: schemaError } = await supabase
            .rpc('get_table_info', { table_name: table });
          
          results.schema[table] = schemaError ? 
            { error: schemaError.message } : 
            { columns: schemaData };
            
          if (schemaError) {
            results.errors.push({
              step: `schema_check_${table}`,
              error: schemaError.message
            });
          }
        }
      } catch (tableError) {
        results.tables[table] = {
          exists: false,
          error: tableError instanceof Error ? tableError.message : String(tableError)
        };
        
        results.errors.push({
          step: `table_check_${table}_error`,
          error: tableError instanceof Error ? tableError.message : String(tableError)
        });
      }
    }
    
    // Verificar sessão atual
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      results.session = {
        exists: !!session,
        userId: session?.user?.id || null,
        error: sessionError ? sessionError.message : null
      };
      
      if (sessionError) {
        results.errors.push({
          step: 'session_check',
          error: sessionError.message
        });
      }
    } catch (sessionError) {
      results.session = {
        exists: false,
        error: sessionError instanceof Error ? sessionError.message : String(sessionError)
      };
      
      results.errors.push({
        step: 'session_check_error',
        error: sessionError instanceof Error ? sessionError.message : String(sessionError)
      });
    }
    
    return NextResponse.json(results);
  } catch (error) {
    results.connection = 'falha';
    results.errors.push({
      step: 'general_error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(results, { status: 500 });
  }
} 