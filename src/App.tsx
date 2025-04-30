import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { InvestmentsPage } from './pages/InvestmentsPage';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import Transactions from './pages/Transactions';
import BillsPage from './pages/BillsPage';
import InvoicesPage from './pages/InvoicesPage';
import TaxPage from './pages/TaxPage';
import HelpPage from './pages/HelpPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RequestPasswordReset from './pages/auth/RequestPasswordReset';
import ResetPassword from './pages/auth/ResetPassword';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import { useAuthStore } from './stores/authStore';
import NotFound from './pages/NotFound';
import StatementPage from './pages/StatementPage';
import CategoryReport from './pages/CategoryReport';
import ExpensesPage from './pages/ExpensesPage';
import IncomePage from './pages/IncomePage';
import VariablesPage from './pages/VariablesPage';
import InvestmentPortfolio from './pages/InvestmentPortfolio';
import { PassiveIncome } from './pages/PassiveIncome';

function App() {
  const location = useLocation();
  const { user } = useAuthStore();

  // Auth routes that don't require authentication
  const authRoutes = ['/login', '/register', '/request-password-reset', '/reset-password'];
  const isAuthRoute = authRoutes.includes(location.pathname);

  if (!user && !isAuthRoute) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && isAuthRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/request-password-reset" element={<RequestPasswordReset />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/goals" element={<Goals />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/bills" element={<BillsPage />} />
      <Route path="/invoices" element={<InvoicesPage />} />
      <Route path="/tax" element={<TaxPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/statement" element={<StatementPage />} />
      <Route path="/category/:categoryId" element={<CategoryReport />} />
      <Route path="/expenses" element={<ExpensesPage />} />
      <Route path="/income" element={<IncomePage />} />
      <Route path="/variables" element={<VariablesPage />} />
      <Route path="/investments" element={<InvestmentsPage />} />
      <Route path="/investment-portfolio" element={<InvestmentPortfolio />} />
      <Route path="/simulator" element={<PassiveIncome />} />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
