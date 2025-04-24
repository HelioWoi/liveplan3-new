import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';

export default function SmartRetirementPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Smart Retirement" />
      <div className="px-4 py-6">
        {/* Add smart retirement content here */}
      </div>
      <BottomNavigation />
    </div>
  );
}