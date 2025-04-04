import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import OpenAI from 'openai';

// Define interfaces para os tipos de status
interface ServiceStatus {
  status: string;
  message?: string;
}

interface HealthCheckResult {
  status: string;
  uptime: number;
  timestamp: string;
  environment: string;
  services: {
    supabase: ServiceStatus;
    openai: ServiceStatus;
  };
  responseTime: number;
}

export async function GET() {
  const startTime = Date.now();
  const checkResults: HealthCheckResult = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      supabase: { status: 'unknown' },
      openai: { status: 'unknown' }
    },
    responseTime: 0
  };

  try {
    // Verificar conexão com Supabase
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Teste simples de consulta ao banco
      const { error } = await supabase.from('ebooks').select('id').limit(1);
      
      if (error) {
        checkResults.services.supabase = { 
          status: 'error', 
          message: error.message 
        };
        checkResults.status = 'degraded';
      } else {
        checkResults.services.supabase = { status: 'healthy' };
      }
    } catch (supabaseError: any) {
      console.error('Erro ao conectar com Supabase:', supabaseError);
      checkResults.services.supabase = { 
        status: 'error', 
        message: supabaseError.message 
      };
      checkResults.status = 'degraded';
    }
    
    // Verificar conexão com OpenAI
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      if (!process.env.OPENAI_API_KEY) {
        checkResults.services.openai = { 
          status: 'error', 
          message: 'API key não configurada' 
        };
        checkResults.status = 'degraded';
      } else {
        // Apenas verificar se a chave existe, não fazer chamada real para economizar tokens
        checkResults.services.openai = { status: 'healthy' };
      }
    } catch (openaiError: any) {
      console.error('Erro com OpenAI:', openaiError);
      checkResults.services.openai = { 
        status: 'error', 
        message: openaiError.message 
      };
      checkResults.status = 'degraded';
    }
    
    // Calcular tempo de resposta
    checkResults.responseTime = Date.now() - startTime;
    
    return NextResponse.json(checkResults);
  } catch (error: any) {
    console.error('Erro ao verificar saúde do sistema:', error);
    
    return NextResponse.json({ 
      status: 'error',
      message: error.message || 'Erro desconhecido',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }, { status: 500 });
  }
} 