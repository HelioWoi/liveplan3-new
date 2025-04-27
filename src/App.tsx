import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useSupabase } from './lib/supabase/SupabaseProvider';
import Loading from './components/ui/Loading';
import { ToastContainer } from './components/ui/Toast';

// Lazy-loaded components
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Goals = lazy(() => import('./pages/Goals'));
const Simulator = lazy(() => import('./pages/PassiveIncome'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const RequestPasswordReset = lazy(() => import('./pages/auth/RequestPasswordReset'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Income = lazy(() => import('./pages/IncomePage'));
const Expenses = lazy(() => import('./pages/ExpensesPage'));
const Variables = lazy(() => import('./pages/VariablesPage'));
const Statement = lazy(() => import('./pages/StatementPage'));
const CategoryReport = lazy(() => import('./pages/CategoryReport'));
const Tax = lazy(() => import('./pages/TaxPage'));
const Help = lazy(() => import('./pages/HelpPage'));
const Invoices = lazy(() => import('./pages/InvoicesPage'));
const Bills = lazy(() => import('./pages/BillsPage'));
const Onboarding = lazy(() => import('./pages/onboarding/OnboardingPage'));

function App() {
  const { supabase } = useSupabase();
  const { user, setUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle password reset from email link
    const handlePasswordReset = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('type=recovery')) {
        try {
          // Extract access token from hash
          const accessToken = hash.split('access_token=')[1]?.split('&')[0];
          if (accessToken) {
            // Remove the hash to clean up the URL
            window.history.replaceState(null, '', window.location.pathname);
            // Navigate to reset password with the token
            navigate('/reset-password', { state: { accessToken } });
          }
        } catch (error) {
          console.error('Failed to handle password reset:', error);
          navigate('/login');
        }
      }
    };

    handlePasswordReset();
  }, [navigate]);

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setUser(null);
          if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/reset-password' && location.pathname !== '/request-password-reset') {
            navigate('/login');
          }
          return;
        }

        if (session) {
          const currentUser = session.user;
          setUser(currentUser);

          // Check if user needs onboarding
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('onboarding_completed')
            .eq('user_id', currentUser.id)
            .single();

          // If user is new or hasn't completed onboarding, redirect to onboarding
          if (!profile?.onboarding_completed && location.pathname !== '/onboarding') {
            navigate('/onboarding');
            return;
          }
        } else {
          setUser(null);
          if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/reset-password' && location.pathname !== '/request-password-reset') {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setUser(null);
        if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/reset-password' && location.pathname !== '/request-password-reset') {
          navigate('/login');
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/login');
          return;
        }

        if (event === 'PASSWORD_RECOVERY') {
          // Handle password recovery event
          const hash = window.location.hash;
          const accessToken = hash.split('access_token=')[1]?.split('&')[0];
          if (accessToken) {
            window.history.replaceState(null, '', window.location.pathname);
            navigate('/reset-password', { state: { accessToken } });
          }
          return;
        }

        if (event === 'TOKEN_REFRESHED') {
          // Re-check session when token is refreshed
          const { data: { session: newSession }, error } = await supabase.auth.getSession();
          if (error || !newSession) {
            console.error('Token refresh failed:', error);
            setUser(null);
            navigate('/login');
            return;
          }
          setUser(newSession.user);
          return;
        }

        if (session) {
          const currentUser = session.user;
          setUser(currentUser);

          // Check if user needs onboarding
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('onboarding_completed')
            .eq('user_id', currentUser.id)
            .single();

          // If user is new or hasn't completed onboarding, redirect to onboarding
          if (!profile?.onboarding_completed && location.pathname !== '/onboarding') {
            navigate('/onboarding');
            return;
          }
        } else if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/reset-password' && location.pathname !== '/request-password-reset') {
          setUser(null);
          navigate('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setUser, navigate, location.pathname]);

  // Loading state while checking authentication
  const isLoading = user === undefined;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Onboarding */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Auth routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" replace /> : <Register />} 
          />
          <Route 
            path="/request-password-reset" 
            element={user ? <Navigate to="/" replace /> : <RequestPasswordReset />} 
          />
          <Route 
            path="/reset-password" 
            element={<ResetPassword />} 
          />

          {/* Protected routes */}
          <Route 
            path="/" 
            element={user ? <Home /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />
          <Route 
            path="/transactions" 
            element={user ? <Transactions /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />
          <Route 
            path="/goals" 
            element={user ? <Goals /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />
          <Route 
            path="/simulator" 
            element={user ? <Simulator /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />

          {/* Bills Page */}
          <Route 
            path="/bills" 
            element={user ? <Bills /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />

          {/* Category Reports */}
          <Route 
            path="/report/:categoryId" 
            element={user ? <CategoryReport /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />

          {/* Tax Page */}
          <Route 
            path="/tax" 
            element={user ? <Tax /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />

          {/* Help Page */}
          <Route 
            path="/help" 
            element={user ? <Help /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />

          {/* Invoices Pages */}
          <Route 
            path="/invoices" 
            element={user ? <Invoices /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />
          <Route 
            path="/invoices/new" 
            element={user ? <Invoices /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />

          {/* Other routes */}
          <Route 
            path="/income" 
            element={user ? <Income /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />
          <Route 
            path="/expenses" 
            element={user ? <Expenses /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />
          <Route 
            path="/variables" 
            element={user ? <Variables /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />
          <Route 
            path="/statement" 
            element={user ? <Statement /> : <Navigate to="/login" state={{ from: location }} replace />} 
          />
          <Route 
            path="/transition" 
            element={<Navigate to="/transactions" replace />} 
          />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </>
  );
}

export default App;
