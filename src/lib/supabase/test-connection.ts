import { supabase } from './client'

async function testConnection() {
  const { data, error } = await supabase.from('goals').select('*')

  if (error) {
    console.error('Erro ao conectar com Supabase:', error.message)
  } else {
    console.log('Conexão bem-sucedida! Dados recebidos:', data)
  }
}

testConnection()
