-- Habilitar extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    subscription_tier TEXT DEFAULT 'free',
    subscription_end TIMESTAMP WITH TIME ZONE
);

-- Tabela ebooks
CREATE TABLE IF NOT EXISTS public.ebooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    language TEXT DEFAULT 'pt',
    cover_image_url TEXT,
    template TEXT,
    color_theme TEXT,
    status TEXT DEFAULT 'draft',
    generation_status TEXT DEFAULT 'pending',
    generation_progress INTEGER DEFAULT 0,
    total_chapters INTEGER DEFAULT 0,
    completed_chapters INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sharing_type TEXT DEFAULT 'private'
);

-- Tabela ebook_chapters
CREATE TABLE IF NOT EXISTS public.ebook_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ebook_id UUID REFERENCES public.ebooks NOT NULL,
    chapter_number INTEGER,
    title TEXT,
    content TEXT,
    status TEXT DEFAULT 'pending',
    generation_started_at TIMESTAMP WITH TIME ZONE,
    generation_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ebook_id UUID REFERENCES public.ebooks,
    email TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebook_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Política para profiles
-- Usuários só podem ver e editar seus próprios perfis
CREATE POLICY "Usuários podem ver seus próprios perfis" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem editar seus próprios perfis" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seus próprios perfis" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Política para ebooks
-- Usuários podem ver seus próprios ebooks ou ebooks compartilhados publicamente
CREATE POLICY "Usuários podem ver seus próprios ebooks" 
    ON public.ebooks FOR SELECT 
    USING (auth.uid() = user_id OR sharing_type = 'public');

CREATE POLICY "Usuários podem editar seus próprios ebooks" 
    ON public.ebooks FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios ebooks" 
    ON public.ebooks FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios ebooks" 
    ON public.ebooks FOR DELETE 
    USING (auth.uid() = user_id);

-- Política para ebook_chapters
-- Usuários podem ver capítulos de seus próprios ebooks ou de ebooks compartilhados publicamente
CREATE POLICY "Usuários podem ver capítulos de seus próprios ebooks" 
    ON public.ebook_chapters FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.ebooks e 
        WHERE e.id = ebook_id AND (e.user_id = auth.uid() OR e.sharing_type = 'public')
    ));

CREATE POLICY "Usuários podem editar capítulos de seus próprios ebooks" 
    ON public.ebook_chapters FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM public.ebooks e 
        WHERE e.id = ebook_id AND e.user_id = auth.uid()
    ));

CREATE POLICY "Usuários podem inserir capítulos em seus próprios ebooks" 
    ON public.ebook_chapters FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.ebooks e 
        WHERE e.id = ebook_id AND e.user_id = auth.uid()
    ));

CREATE POLICY "Usuários podem excluir capítulos de seus próprios ebooks" 
    ON public.ebook_chapters FOR DELETE 
    USING (EXISTS (
        SELECT 1 FROM public.ebooks e 
        WHERE e.id = ebook_id AND e.user_id = auth.uid()
    ));

-- Política para leads
-- Usuários só podem ver leads associados aos seus próprios ebooks
CREATE POLICY "Usuários podem ver leads de seus próprios ebooks" 
    ON public.leads FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.ebooks e 
        WHERE e.id = ebook_id AND e.user_id = auth.uid()
    ));

-- Qualquer pessoa pode inserir leads em ebooks públicos
CREATE POLICY "Qualquer pessoa pode inserir leads em ebooks públicos" 
    ON public.leads FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.ebooks e 
        WHERE e.id = ebook_id AND e.sharing_type = 'public'
    ));

-- Inserir função de gatilho para criar perfil quando um usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar gatilho para criar perfil quando um usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 