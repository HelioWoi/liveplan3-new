import { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get the Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase credentials are properly configured
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://example.supabase.co' || supabaseAnonKey === 'dummy-key') {
  console.error('⚠️ Supabase URL or Anonymous Key not properly configured!');
  console.error('Please connect to Supabase using the "Connect to Supabase" button in the top right corner.');
}

type SupabaseContextType = {
  supabase: SupabaseClient;
  isInitialized: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient(supabaseUrl || '', supabaseAnonKey || ''));
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Use transactions table for health check
        const { error: healthError } = await supabase.from('transactions').select('count').single();
        if (healthError && healthError.code !== 'PGRST204') { // Ignore "no rows returned" error
          console.error('Supabase connection error:', healthError);
        } else {
          console.log('Supabase connection successful');
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        setIsInitialized(true); // Still set to true so the app doesn't hang
      }
    };

    checkConnection();
  }, [supabase]);

  const value = {
    supabase,
    isInitialized,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}