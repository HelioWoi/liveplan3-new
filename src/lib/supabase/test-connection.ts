import { supabase } from './client'

// Cria um novo objetivo (goal)
async function insertGoal() {
  const { data, error } = await supabase
    .from('goals')
    .insert([
      {
        title: 'Estudar React com Supabase',
        completed: false,
        created_at: new Date().toISOString(),
      }
    ])

  if (error) {
    console.error('Erro ao inserir goal:', error)
  } else {
    console.log('Goal inserido com sucesso:', data)
  }
}

insertGoal()
