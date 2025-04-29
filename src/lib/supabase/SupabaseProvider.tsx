import { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation of Supabase credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase URL or Anonymous Key is missing!');
  console.error('Please connect to Supabase using the "Connect to Supabase" button in the top right corner.');
} else if (supabaseUrl === 'https://example.supabase.co' || supabaseAnonKey === 'dummy-key') {
  console.error('⚠️ Supabase URL or Anonymous Key is using default values!');
  console.error('Please connect to Supabase using the "Connect to Supabase" button in the top right corner.');
}

type SupabaseContextType = {
  supabase: SupabaseClient;
  isInitialized: boolean;
  connectionError: string | null;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }));
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Clear any previous connection errors
        setConnectionError(null);

        // Basic connectivity check
        const { error: pingError } = await supabase.from('transactions').select('count').single();
        
        if (pingError) {
          if (pingError.code === 'PGRST204') {
            // This is actually not an error - just means no rows were found
            // console.log('Supabase connection successful (no data found)');
            setIsInitialized(true);
            setRetryCount(0);
            return;
          }

          if (pingError.code === '401') {
            throw new Error('Authentication failed. Please check your Supabase credentials.');
          }

          throw new Error(`Database error: ${pingError.message}`);
        }

        // If we get here, connection was successful
        // console.log('Supabase connection successful');
        setIsInitialized(true);
        setRetryCount(0);

      } catch (err) {
        const error = err as Error;
        console.error('Supabase connection error:', error);

        // Set a user-friendly error message
        setConnectionError(
          error.message.includes('fetch') 
            ? 'Unable to connect to Supabase. Please check your internet connection.'
            : error.message
        );

        // Implement retry logic
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying connection (attempt ${retryCount + 1} of ${MAX_RETRIES})...`);
          setRetryCount(prev => prev + 1);
          setTimeout(checkConnection, RETRY_DELAY);
        } else {
          console.error('Max retry attempts reached');
          setIsInitialized(true); // Set to true so the app doesn't hang
        }
      }
    };

    checkConnection();
  }, [supabase, retryCount]);

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Clear any cached data or perform cleanup if needed
        console.log('User signed out, clearing session');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = {
    supabase,
    isInitialized,
    connectionError
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