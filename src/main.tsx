import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { SupabaseProvider } from './lib/supabase/SupabaseProvider'

// ⬇️ Adicione essa linha para testar a conexão
import './lib/supabase/test-connection'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SupabaseProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SupabaseProvider>
  </StrictMode>
)
