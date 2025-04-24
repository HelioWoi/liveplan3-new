import { createClient } from '@supabase/supabase-js'

// Busca as variáveis de ambiente do arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cria o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
