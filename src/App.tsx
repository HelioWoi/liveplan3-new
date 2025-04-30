import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { InvestmentsPage } from './pages/InvestmentsPage';

function App() {
  const location = useLocation();
  const user = true; // This is likely coming from your auth context/store in the actual app

  return (
    <Routes>
      <Route 
        path="/investments" 
        element={user ? <InvestmentsPage /> : <Navigate to="/login" state={{ from: location }} replace />} 
      />
    </Routes>
  );
}

export default App;
