import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/forms/TransactionForm';
import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';

export default function TransitionPage() {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSuccess = () => {
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      navigate(-1);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Add New Transaction" />
      
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-card">
          <TransactionForm 
            defaultType="transfer"
            onSuccess={handleSuccess}
          />
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center animate-slide-up">
            <div className="w-20 h-20 bg-[#120B39] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Transaction Added
            </h2>
            <p className="text-gray-600">
              The transaction has been recorded successfully
            </p>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}