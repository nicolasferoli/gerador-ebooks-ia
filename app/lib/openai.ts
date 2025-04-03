import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('A variável de ambiente OPENAI_API_KEY não está definida');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEbookTitle(description: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em criar títulos atrativos e profissionais para e-books."
        },
        {
          role: "user",
          content: `Crie um título atrativo para um e-book com a seguinte descrição: "${description}". Retorne apenas o título, sem aspas ou formatação adicional.`
        }
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    return response.choices[0].message.content?.trim() || 'Novo E-book';
  } catch (error) {
    console.error('Erro ao gerar título do e-book:', error);
    return 'Novo E-book';
  }
}

export async function generateEbookChapter(
  title: string,
  description: string,
  chapterTitle: string,
  previousChapterContent?: string,
  options?: {
    model?: string;
    signal?: AbortSignal;
  }
): Promise<string> {
  try {
    const systemPrompt = `Você é um assistente especializado em escrever conteúdo de alta qualidade para e-books.`;
    
    let userPrompt = `Escreva o capítulo "${chapterTitle}" para um e-book com o título "${title}" e a seguinte descrição: "${description}".`;
    
    if (previousChapterContent) {
      userPrompt += `\n\nO conteúdo do capítulo anterior é: "${previousChapterContent}"\n\nContinue a narrativa de forma coerente.`;
    }
    
    userPrompt += `\n\nFormate o conteúdo em HTML simples com tags <h1>, <h2>, <p>, <ul>, <li>, etc., quando apropriado.`;

    const requestOptions = options?.signal ? { signal: options.signal } : undefined;

    const response = await openai.chat.completions.create({
      model: options?.model || "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }, requestOptions);

    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('Erro ao gerar capítulo do e-book:', error);
    throw new Error('Falha ao gerar conteúdo do capítulo');
  }
}

export async function generateTableOfContents(
  title: string, 
  description: string,
  options?: {
    model?: string;
    signal?: AbortSignal;
  }
): Promise<string[]> {
  try {
    const requestOptions = options?.signal ? { signal: options.signal } : undefined;

    const response = await openai.chat.completions.create({
      model: options?.model || "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em estruturar e-books profissionais."
        },
        {
          role: "user",
          content: `Crie uma estrutura de capítulos para um e-book com o título "${title}" e a seguinte descrição: "${description}". 
          Retorne apenas uma lista com os títulos dos capítulos, sem numeração ou formatação adicional. 
          A lista deve ter entre 5 e 10 capítulos, dependendo da complexidade do assunto.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }, requestOptions);

    const content = response.choices[0].message.content?.trim() || '';
    
    // Processar a resposta para extrair apenas os títulos dos capítulos
    const chapters = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^\d+\.\s*|-\s*|\*/g, '').trim());
    
    return chapters;
  } catch (error) {
    console.error('Erro ao gerar sumário do e-book:', error);
    throw error;
  }
}

export async function generateCoverImage(
  title: string,
  description: string,
  options?: {
    size?: "1024x1024" | "1792x1024" | "1024x1792";
    signal?: AbortSignal;
  }
): Promise<string> {
  try {
    const prompt = `Uma capa de e-book moderna e profissional para o livro intitulado "${title}". 
    Descrição do livro: "${description}".
    A capa deve ser visualmente impactante, com tipografia clara e elementos de design minimalista.
    Sem texto ou palavras visíveis além do título.`;

    const requestOptions = options?.signal ? { signal: options.signal } : undefined;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: options?.size || "1024x1024",
      quality: "standard",
      response_format: "url",
    }, requestOptions);

    return response.data[0].url || '';
  } catch (error) {
    console.error('Erro ao gerar capa do e-book:', error);
    throw error;
  }
} 