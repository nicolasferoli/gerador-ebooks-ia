import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    // Configurações do Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Configuração do Supabase não encontrada.' },
        { status: 500 }
      );
    }
    
    // Criar um cliente Supabase anônimo
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verificar autenticação usando o cabeçalho de autorização da requisição original
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      );
    }
    
    // Extrair título do corpo da requisição
    const body = await request.json();
    const { title } = body;
    
    if (!title) {
      return NextResponse.json(
        { error: 'O título é obrigatório para gerar uma descrição.' },
        { status: 400 }
      );
    }
    
    // Verificar a chave da API do OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Configuração do serviço de IA não disponível.' },
        { status: 500 }
      );
    }
    
    // Configurar OpenAI
    const openai = new OpenAI({ apiKey });
    
    // Gerar descrição
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em criar descrições atraentes e informativas para e-books. Crie uma descrição com aproximadamente 2-3 parágrafos que desperte interesse e explique o escopo do conteúdo."
        },
        {
          role: "user",
          content: `Crie uma descrição atraente e informativa para um e-book com o título: "${title}"`
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });
    
    const description = completion.choices[0]?.message?.content?.trim();
    
    if (!description) {
      return NextResponse.json(
        { error: 'Não foi possível gerar uma descrição. Tente novamente.' },
        { status: 500 }
      );
    }
    
    // Registrar uso da API no Supabase
    try {
      await supabase.from('ai_usage_logs').insert({
        user_id: user.id,
        feature: 'generate_description',
        input: title,
        output_length: description.length,
        created_at: new Date().toISOString()
      });
    } catch (logError) {
      // Apenas registre o erro, não interrompa o fluxo principal
      console.warn('Erro ao registrar uso da API:', logError);
    }
    
    return NextResponse.json({ description });
    
  } catch (error: any) {
    console.error('Erro ao gerar descrição:', error);
    
    // Verificar se é um erro da API da OpenAI
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Limite de requisições à API excedido. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar descrição.' },
      { status: 500 }
    );
  }
} 