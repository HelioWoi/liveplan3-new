import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useSupabase } from './lib/supabase/SupabaseProvider';
import Loading from './components/ui/Loading';
import { ToastContainer } from './components/ui/Toast';

// Lazy-loaded components
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
// --- ALTERADO: Nome da variável e caminho do arquivo ---
const Statement = lazy(() => import('./pages/Statement')); // Assumindo que você renomeou o arquivo para Statement.tsx
const Goals = lazy(() => import('./pages/Goals'));
const PassiveIncome = lazy(() => import('./pages/PassiveIncome'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Income = lazy(() => import('./pages/IncomePage'));
const Expenses = lazy(() => import('./pages/ExpensesPage'));
const Bills = lazy(() => import('./pages/BillsPage'));
const CategoryReport = lazy(() => import('./pages/CategoryReport'));
const Tax = lazy(() => import('./pages/TaxPage'));
const Help = lazy(() => import('./pages/HelpPage'));

function App() {
  const { supabase } = useSupabase();
  const { user, setUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session check error:', error);
          setUser(null);
          navigate('/login');
          return;
        }

        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setUser(null);
        navigate('/login');
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || !session) {
          setUser(null);
          if (location.pathname !== '/login') {
            navigate('/login');
          }
          return;
        }

        if (session) {
          setUser(session.user);
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
            path="/reset-password"
            element={user ? <Navigate to="/" replace /> : <ResetPassword />}
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
          {/* --- ALTERADO: path e element --- */}
          <Route
            path="/statement" // URL alterada
            element={user ? <Statement /> : <Navigate to="/login" state={{ from: location }} replace />} // Usando componente Statement
          />
          {/* --- ADICIONADO: Redirecionamento --- */}
          <Route path="/transactions" element={<Navigate to="/statement" replace />} /> {/* Redireciona URL antiga */}
          <Route
            path="/goals"
            element={user ? <Goals /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/passive-income"
            element={user ? <PassiveIncome /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" state={{ from: location }} replace />}
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

          {/* Other routes */}
          <Route
            path="/income"
            element={user ? <Income /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/expenses"
            element={user ? <Expenses /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          {/* --- ALTERADO: Redirecionamento da rota /transition --- */}
          <Route
            path="/transition"
            element={<Navigate to="/statement" replace />} // Atualizado para redirecionar para /statement
          />
          <Route
            path="/bills"
            element={user ? <Bills /> : <Navigate to="/login" state={{ from: location }} replace />}
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