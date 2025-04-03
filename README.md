# Gerador de E-books com IA

Uma aplicação Next.js para gerar e-books profissionais com auxílio de inteligência artificial.

## Recursos principais

- Geração automática de conteúdo com OpenAI
- Interface moderna e responsiva com Tailwind CSS e shadcn UI
- Modo escuro como padrão
- Autenticação completa com Supabase
- Processamento assíncrono para tarefas de geração
- Exportação de e-books em diferentes formatos

## Tecnologias utilizadas

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (autenticação, banco de dados)
- **IA**: OpenAI API
- **Gerenciamento de estado**: SWR para chamadas assíncronas
- **Outros**: React-quill, jspdf, html2canvas

## Requisitos para execução

- Node.js 18.x ou superior
- Conta no Supabase
- Chave de API da OpenAI

## Configuração do ambiente

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env.local` baseado no `.env.example` e adicione suas chaves:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # OpenAI
   OPENAI_API_KEY=your-openai-api-key

   # Aplicação
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acesse `http://localhost:3000`

## Estrutura do banco de dados (Supabase)

### Tabela `profiles`
- id (UUID, PK, referência para auth.users)
- full_name (TEXT)
- avatar_url (TEXT)
- credits (INTEGER)
- role (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Tabela `ebooks`
- id (UUID, PK)
- user_id (UUID, FK para profiles.id)
- title (TEXT)
- description (TEXT)
- template_id (UUID, nullable)
- cover_image_url (TEXT, nullable)
- status (TEXT) - enum: 'draft', 'generating_toc', 'generating_chapters', 'generating_cover', 'completed', 'failed'
- progress (INTEGER)
- toc_generated (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Tabela `chapters`
- id (UUID, PK)
- ebook_id (UUID, FK para ebooks.id)
- title (TEXT)
- number (INTEGER)
- content (TEXT)
- status (TEXT) - enum: 'pending', 'generating', 'completed', 'failed'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Tabela `templates`
- id (UUID, PK)
- name (TEXT)
- description (TEXT)
- cover_image_url (TEXT)
- chapter_structure (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Fluxo de geração de e-books

1. Usuário escolhe um template ou cria um e-book do zero
2. Usuário fornece título e descrição do e-book
3. O sistema gera automaticamente o sumário (tabela de conteúdos)
4. O sistema gera o conteúdo de cada capítulo sequencialmente
5. O sistema gera uma capa para o e-book
6. Usuário pode revisar e editar o conteúdo gerado
7. Usuário pode exportar o e-book para PDF ou HTML

## Contribuição

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
