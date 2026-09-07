-- ============================================================
-- FRAMECALCPRO - SUPABASE POSTGRESQL SCHEMA
-- Run this in the Supabase SQL Editor (https://app.supabase.com)
-- ============================================================

-- 1. Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  project_type TEXT NOT NULL DEFAULT 'exterior',
  measurement_system TEXT NOT NULL DEFAULT 'imperial',
  notes TEXT DEFAULT '',
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  material_prices JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_takeoff_lines JSONB NOT NULL DEFAULT '[]'::jsonb,
  line_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Walls Table
CREATE TABLE IF NOT EXISTS public.walls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  length NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Openings Table (Doors & Windows)
CREATE TABLE IF NOT EXISTS public.openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  wall_id UUID REFERENCES public.walls(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('door', 'window')),
  width NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  header_size TEXT NOT NULL DEFAULT '2x8',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Automatic updated_at trigger for projects
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_project_updated_at ON public.projects;
CREATE TRIGGER set_project_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can ONLY see, edit, or delete their own data
-- ============================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.openings ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Walls policies (via project ownership)
CREATE POLICY "Users can view walls of their projects"
  ON public.walls FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE public.projects.id = public.walls.project_id
    AND public.projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert walls into their projects"
  ON public.walls FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE public.projects.id = public.walls.project_id
    AND public.projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update walls of their projects"
  ON public.walls FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE public.projects.id = public.walls.project_id
    AND public.projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete walls of their projects"
  ON public.walls FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE public.projects.id = public.walls.project_id
    AND public.projects.user_id = auth.uid()
  ));

-- Openings policies (via project ownership)
CREATE POLICY "Users can view openings of their projects"
  ON public.openings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE public.projects.id = public.openings.project_id
    AND public.projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert openings into their projects"
  ON public.openings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE public.projects.id = public.openings.project_id
    AND public.projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update openings of their projects"
  ON public.openings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE public.projects.id = public.openings.project_id
    AND public.projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete openings of their projects"
  ON public.openings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE public.projects.id = public.openings.project_id
    AND public.projects.user_id = auth.uid()
  ));
