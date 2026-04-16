-- =============================================
-- LOCALIZANDO — Schema inicial de base de datos
-- Ejecutar en: Supabase > SQL Editor
-- =============================================

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('buscador', 'publicador')),
  nombre TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de preferencias del buscador
CREATE TABLE public.buscador_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rubro TEXT,
  zonas TEXT[],
  superficie_min INTEGER,
  superficie_max INTEGER,
  precio_maximo INTEGER,
  umbral_alerta INTEGER DEFAULT 75,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de datos del publicador
CREATE TABLE public.publicador_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  empresa TEXT,
  telefono TEXT NOT NULL,
  cuit TEXT NOT NULL,
  condicion_iva TEXT NOT NULL,
  tipo_publicador TEXT NOT NULL CHECK (tipo_publicador IN ('propietario', 'inmobiliaria', 'administrador')),
  matricula TEXT,
  sitio_web TEXT,
  plan_actual TEXT CHECK (plan_actual IN ('estandar', 'destacado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SEGURIDAD: Row Level Security (RLS)
-- Cada usuario solo puede ver y editar sus propios datos
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buscador_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicador_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Ver propio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Crear propio perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Editar propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para buscador_preferences
CREATE POLICY "Ver propias preferencias" ON public.buscador_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Crear propias preferencias" ON public.buscador_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Editar propias preferencias" ON public.buscador_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para publicador_profiles
CREATE POLICY "Ver propio perfil publicador" ON public.publicador_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Crear propio perfil publicador" ON public.publicador_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Editar propio perfil publicador" ON public.publicador_profiles FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGER: Crear perfil automáticamente al registrarse
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crea la fila si el rol ya viene en metadata
  -- (para registro con email). Google OAuth completa el perfil después.
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, nombre, role)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'role'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
