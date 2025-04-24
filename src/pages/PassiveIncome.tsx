import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Calculator, Info, TrendingUp, Target, ChevronRight, HeartHandshake, Share2 } from 'lucide-react';
import { useGoalsStore } from '../stores/goalsStore';
import { formatISO } from 'date-fns';
import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';
import classNames from 'classnames';
import { useSupabase } from '../lib/supabase/SupabaseProvider';

interface SimulationData {
  year: number;
  balance: number;
  contributions: number;
  returns: number;
  monthlyIncome: number;
}

export default function PassiveIncome() {
  const navigate = useNavigate();
  const { addGoal } = useGoalsStore();
  const { supabase } = useSupabase();
  
  // Form state
  const [investmentName, setInvestmentName] = useState('');
  const [initialInvestment, setInitialInvestment] = useState(5000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [investmentTerm, setInvestmentTerm] = useState(30);
  const [expectedReturn, setExpectedReturn] = useState(18);
  const [contributionGrowth, setContributionGrowth] = useState(10);
  
  // UI state
  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const [showSaveGoalModal, setShowSaveGoalModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const calculateCompoundInterest = () => {
    setIsCalculating(true);
    
    const data: SimulationData[] = [];
    let balance = initialInvestment;
    let totalContributions = initialInvestment;
    let monthlyAmount = monthlyContribution;
    
    for (let year = 0; year <= investmentTerm; year++) {
      // Calculate annual return
      const annualReturn = balance * (expectedReturn / 100);
      
      // Add annual contributions
      const annualContribution = monthlyAmount * 12;
      balance += annualContribution + annualReturn;
      totalContributions += annualContribution;
      
      // Calculate monthly passive income (1% monthly dividend yield)
      const monthlyIncome = balance * 0.01;
      
      // Increase monthly contribution by growth rate
      monthlyAmount *= (1 + contributionGrowth / 100);
      
      data.push({
        year,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions),
        returns: Math.round(balance - totalContributions),
        monthlyIncome: Math.round(monthlyIncome)
      });
    }
    
    setSimulationData(data);
    setIsCalculating(false);
  };

  const handleSaveAsGoal = async () => {
    if (!investmentName || simulationData.length === 0) return;
    
    setIsSaving(true);
    
    try {
      const finalAmount = simulationData[simulationData.length - 1].balance;
      
      await addGoal(supabase, {
        title: investmentName,
        description: `Passive Income Investment - ${investmentTerm} years @ ${expectedReturn}% return`,
        targetAmount: finalAmount,
        currentAmount: initialInvestment,
        targetDate: formatISO(new Date(new Date().setFullYear(new Date().getFullYear() + investmentTerm))),
        userId: 'current-user',
      });
      
      setShowSaveGoalModal(false);
      navigate('/goals');
    } catch (error) {
      console.error('Failed to save goal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleShare = async (method: 'email' | 'sms') => {
    if (!simulationData.length) return;

    const finalBalance = simulationData[simulationData.length - 1].balance;
    const monthlyIncome = simulationData[simulationData.length - 1].monthlyIncome;

    const shareText = `Check out my investment projection with LivePlan³!\n\n` +
      `Investment Term: ${investmentTerm} years\n` +
      `Final Balance: ${formatCurrency(finalBalance)}\n` +
      `Monthly Passive Income: ${formatCurrency(monthlyIncome)}\n\n` +
      `Start your financial journey today!`;

    try {
      if (method === 'email') {
        window.location.href = `mailto:?subject=My Investment Projection&body=${encodeURIComponent(shareText)}`;
      } else {
        window.location.href = `sms:?body=${encodeURIComponent(shareText)}`;
      }
      setShowShareModal(false);
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Passive Income" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Simulate your future wealth and monthly income through consistent investing. 
          See how compound interest and regular contributions can grow your wealth over time.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator Form */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Investment Calculator</h2>
                  <p className="text-sm text-gray-500">Plan your financial future</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="form-group">
                  <label className="label">Investment Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Retirement Fund"
                    value={investmentName}
                    onChange={(e) => setInvestmentName(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Initial Investment</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      className="input pl-8"
                      min="0"
                      step="0.01"
                      value={initialInvestment}
                      onChange={(e) => setInitialInvestment(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="label">Monthly Contribution</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      className="input pl-8"
                      min="0"
                      step="0.01"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="label">Investment Term (Years)</label>
                  <div className="text-center mb-2 text-2xl font-bold text-primary-600">
                    {investmentTerm} Years
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={investmentTerm}
                    onChange={(e) => setInvestmentTerm(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1 year</span>
                    <span>30 years</span>
                    <span>60 years</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="label">Expected Annual Return (%)</label>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    max="30"
                    step="0.1"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Annual Contribution Growth (%)</label>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    max="20"
                    step="0.1"
                    value={contributionGrowth}
                    onChange={(e) => setContributionGrowth(Number(e.target.value))}
                  />
                </div>

                <button
                  onClick={calculateCompoundInterest}
                  disabled={isCalculating}
                  className="btn btn-primary w-full"
                >
                  {isCalculating ? 'Calculating...' : 'Simulate Growth'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Results Section */}
          <div className="lg:col-span-2">
            {simulationData.length > 0 ? (
              <div className="space-y-6">
                {/* Add Share Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="btn btn-outline flex items-center gap-2"
                  >
                    <Share2 className="h-5 w-5" />
                    Share Results
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary-600" />
                      </div>
                      <h3 className="text-lg font-semibold">Final Balance</h3>
                    </div>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatCurrency(simulationData[simulationData.length - 1].balance)}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                        <Target className="h-5 w-5 text-secondary-600" />
                      </div>
                      <h3 className="text-lg font-semibold">Total Invested</h3>
                    </div>
                    <p className="text-2xl font-bold text-secondary-600">
                      {formatCurrency(simulationData[simulationData.length - 1].contributions)}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                        <ChevronRight className="h-5 w-5 text-accent-600" />
                      </div>
                      <h3 className="text-lg font-semibold">Total Returns</h3>
                    </div>
                    <p className="text-2xl font-bold text-accent-600">
                      {formatCurrency(simulationData[simulationData.length - 1].returns)}
                    </p>
                  </div>
                </div>

                {/* Monthly Passive Income Projections */}
                <div className="bg-white rounded-xl p-6 shadow-card">
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-xl font-bold">Monthly Passive Income</h3>
                    <span className="text-sm text-gray-500">(Based on 1% monthly dividend yield)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[10, 30, 60].map(year => {
                      const yearData = simulationData.find(d => d.year === year);
                      if (!yearData) return null;

                      return (
                        <div key={year} className="bg-gray-50 rounded-xl p-4">
                          <h4 className="text-lg font-semibold mb-2">{year} Years</h4>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-gray-500">Projected Wealth</p>
                              <p className="text-lg font-bold text-primary-600">
                                {formatCurrency(yearData.balance)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Monthly Income</p>
                              <p className="text-lg font-bold text-success-600">
                                {formatCurrency(yearData.monthlyIncome)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Growth Chart */}
                <div className="bg-white rounded-xl p-6 shadow-card">
                  <h3 className="text-xl font-bold mb-6">Investment Growth</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={simulationData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="year" 
                          label={{ value: 'Years', position: 'insideBottomRight', offset: -10 }} 
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} 
                        />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(Number(value)), undefined]}
                          labelFormatter={(label) => `Year ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="balance" 
                          name="Total Balance"
                          stroke="#4F46E5" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="contributions" 
                          name="Total Invested"
                          stroke="#10B981" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="returns" 
                          name="Investment Returns"
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Save as Goal Button */}
                <button
                  onClick={() => setShowSaveGoalModal(true)}
                  className="btn btn-primary w-full"
                >
                  Save as Investment Goal
                </button>

                {/* Disclaimer */}
                <p className="text-sm text-gray-500 text-center">
                  Important: These are only simulations and not a guarantee of return. 
                  Past performance does not guarantee future results.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 shadow-card text-center">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
                  <Calculator className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Calculate Your Investment Growth
                </h3>
                <p className="text-gray-600 mb-6">
                  Enter your investment details to see how your money could grow over time with compound interest.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Coach Section */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <HeartHandshake className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Need help building your passive income strategy?</h3>
              <p className="text-gray-600">Get personalized guidance from a financial expert</p>
            </div>
            <button className="btn btn-primary ml-auto">
              Connect with a Financial Coach
            </button>
          </div>
        </div>

        {/* Save Goal Modal */}
        {showSaveGoalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
              <h2 className="text-xl font-bold mb-4">Save as Investment Goal</h2>
              <p className="text-gray-600 mb-6">
                This will create a new goal to track your progress towards your investment target of {formatCurrency(simulationData[simulationData.length - 1].balance)}.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={handleSaveAsGoal}
                  disabled={isSaving}
                  className={classNames(
                    'btn btn-primary w-full',
                    isSaving && 'opacity-75 cursor-not-allowed'
                  )}
                >
                  {isSaving ? 'Saving...' : 'Save Goal'}
                </button>
                <button
                  onClick={() => setShowSaveGoalModal(false)}
                  className="btn btn-outline w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
              <h2 className="text-xl font-bold mb-4">Share Investment Projection</h2>
              <p className="text-gray-600 mb-6">
                Choose how you'd like to share your investment projection:
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => handleShare('email')}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Share via Email
                </button>
                
                <button
                  onClick={() => handleShare('sms')}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Share via SMS
                </button>

                <button
                  onClick={() => setShowShareModal(false)}
                  className="btn btn-outline w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}