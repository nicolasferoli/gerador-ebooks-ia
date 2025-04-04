import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
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