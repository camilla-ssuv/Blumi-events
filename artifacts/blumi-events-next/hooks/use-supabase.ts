'use client'

// Mantido para compatibilidade — usado apenas para queries de dados (não auth)
import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSupabase() {
  return useMemo(() => createClient(), [])
}
