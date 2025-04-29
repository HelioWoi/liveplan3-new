import { useState, useEffect } from 'react';
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
import { Calculator, Info, TrendingUp, Target, ChevronRight, HeartHandshake, Share2, Download, ChevronLeft } from 'lucide-react';
import { useGoalsStore } from '../stores/goalsStore';
import { formatISO } from 'date-fns';
import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';
import classNames from 'classnames';
import { useSupabase } from '../lib/supabase/SupabaseProvider';

interface MonthlyProjection {
  month: number;
  contribution: number;
  balance: number;
  monthlyIncome: number;
}

interface SimulationData {
  year: number;
  balance: number;
  contributions: number;
  returns: number;
  monthlyIncome: number;
}

export default function Simulator() {
  const navigate = useNavigate();
  const { addGoal } = useGoalsStore();
  const { supabase } = useSupabase();
  
  // Form state
  const [investmentName, setInvestmentName] = useState('');
  const [initialInvestment, setInitialInvestment] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [investmentTerm, setInvestmentTerm] = useState(30);
  const [expectedReturn, setExpectedReturn] = useState(18);
  const [contributionGrowth, setContributionGrowth] = useState(10);
  
  // Monthly projections state
  const [monthlyProjections, setMonthlyProjections] = useState<MonthlyProjection[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const monthsPerPage = 12;
  
  // UI state
  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const [showSaveGoalModal, setShowSaveGoalModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openExplanation, setOpenExplanation] = useState<string | null>(null);

  const toggleExplanation = (id: string) => {
    setOpenExplanation(openExplanation === id ? null : id);
  };

  const handleInitialInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value === '' || value === '.') {
      setInitialInvestment('');
      return;
    }
    
    // Handle decimal points
    const parts = value.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    
    setInitialInvestment(value);
  };

  const handleMonthlyContributionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value === '' || value === '.') {
      setMonthlyContribution('');
      return;
    }
    
    // Handle decimal points
    const parts = value.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    
    setMonthlyContribution(value);
  };

  const formatCurrency = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'AU$ 0.00';
    
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  const handleInputBlur = (value: string, setter: (value: string) => void) => {
    if (!value) {
      setter('');
      return;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setter('');
      return;
    }
    setter(formatCurrency(numValue));
  };

  // Calculate monthly projections
  const calculateMonthlyProjections = () => {
    const projections: MonthlyProjection[] = [];
    let balance = parseFloat(initialInvestment.replace(/[^0-9.]/g, '') || '0');
    let monthlyAmount = parseFloat(monthlyContribution.replace(/[^0-9.]/g, '') || '0');
    const monthlyRate = (Math.pow(1 + expectedReturn / 100, 1/12) - 1);
    const monthlyGrowthRate = (Math.pow(1 + contributionGrowth / 100, 1/12) - 1);

    for (let month = 1; month <= investmentTerm * 12; month++) {
      const monthlyReturn = balance * monthlyRate;
      balance += monthlyAmount + monthlyReturn;
      const monthlyIncome = balance * 0.01;
      monthlyAmount *= (1 + monthlyGrowthRate);
      
      projections.push({
        month,
        contribution: monthlyAmount,
        balance,
        monthlyIncome,
      });
    }

    setMonthlyProjections(projections);
  };

  useEffect(() => {
    if (simulationData.length > 0) {
      calculateMonthlyProjections();
    }
  }, [simulationData]);

  const calculateCompoundInterest = () => {
    setIsCalculating(true);
    
    const data: SimulationData[] = [];
    let balance = parseFloat(initialInvestment.replace(/[^0-9.]/g, '') || '0');
    let totalContributions = balance;
    let monthlyAmount = parseFloat(monthlyContribution.replace(/[^0-9.]/g, '') || '0');
    
    for (let year = 0; year <= investmentTerm; year++) {
      const annualReturn = balance * (expectedReturn / 100);
      const annualContribution = monthlyAmount * 12;
      balance += annualContribution + annualReturn;
      totalContributions += annualContribution;
      monthlyAmount *= (1 + contributionGrowth / 100);
      
      const monthlyIncome = balance * 0.01;
      
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
        currentAmount: parseFloat(initialInvestment.replace(/[^0-9.-]+/g, '')),
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

  const exportToCSV = () => {
    const headers = ['Month', 'Contribution', 'Balance', 'Monthly Income'];
    const csvContent = [
      headers.join(','),
      ...monthlyProjections.map(row => [
        row.month,
        formatCurrency(row.contribution.toString()),
        formatCurrency(row.balance.toString()),
        formatCurrency(row.monthlyIncome.toString())
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `investment_projections_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (method: 'email' | 'sms') => {
    if (!simulationData.length) return;

    const finalBalance = simulationData[simulationData.length - 1].balance;
    const monthlyIncome = simulationData[simulationData.length - 1].monthlyIncome;

    const shareText = `Check out my investment projection with LivePlan³!\n\n` +
      `Investment Term: ${investmentTerm} years\n` +
      `Final Balance: ${formatCurrency(finalBalance.toString())}\n` +
      `Monthly Passive Income: ${formatCurrency(monthlyIncome.toString())}\n\n` +
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

  // Get paginated data
  const paginatedData = monthlyProjections.slice(
    (currentPage - 1) * monthsPerPage,
    currentPage * monthsPerPage
  );

  const totalPages = Math.ceil(monthlyProjections.length / monthsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Investment Simulator" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-8 shadow-card">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-[#EEF2FF] rounded-full flex items-center justify-center">
                  <Calculator className="h-8 w-8 text-[#4F46E5]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Investment Calculator</h2>
                  <p className="text-gray-500">Plan your financial future</p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="text-lg font-medium text-gray-700 mb-2 block">
                    Investment Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 text-lg bg-white rounded-xl border border-gray-200 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                    placeholder="e.g., Retirement Fund"
                    value={investmentName}
                    onChange={(e) => setInvestmentName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-lg font-medium text-gray-700 mb-2 block">
                    Initial Investment
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full pl-12 pr-4 py-3 text-lg bg-white rounded-xl border border-gray-200 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                      placeholder="0.00"
                      value={initialInvestment}
                      onChange={handleInitialInvestmentChange}
                      onBlur={(e) => handleInputBlur(e.target.value, setInitialInvestment)}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">AU$</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-lg font-medium text-gray-700 mb-2 block">
                    Monthly Contribution
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full pl-12 pr-4 py-3 text-lg bg-white rounded-xl border border-gray-200 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                      placeholder="0.00"
                      value={monthlyContribution}
                      onChange={handleMonthlyContributionChange}
                      onBlur={(e) => handleInputBlur(e.target.value, setMonthlyContribution)}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">AU$</span>
                  </div>
                </div>

                <div>
                  <label className="text-lg font-medium text-gray-700 mb-2 block">
                    Investment Term (Years)
                  </label>
                  <div className="text-center mb-2 text-2xl font-bold text-[#4F46E5]">
                    {investmentTerm} Years
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={investmentTerm}
                    onChange={(e) => setInvestmentTerm(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1 year</span>
                    <span>30 years</span>
                    <span>60 years</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-lg font-medium text-gray-700 mb-2 block">
                    Expected Annual Return (%)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 text-lg bg-white rounded-xl border border-gray-200 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                    min="0"
                    max="30"
                    step="0.1"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  />
                </div>
                
                <div>
                  <label className="text-lg font-medium text-gray-700 mb-2 block">
                    Annual Contribution Growth (%)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 text-lg bg-white rounded-xl border border-gray-200 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors"
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
                  className="w-full py-4 text-lg font-semibold bg-[#4F46E5] text-white rounded-xl hover:bg-[#4338CA] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                    <p className="text-2xl font-bold text-primary-600 mb-2">
                      {formatCurrency(simulationData[simulationData.length - 1].balance.toString())}
                    </p>
                    <button
                      onClick={() => toggleExplanation('finalBalance')}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      What does this mean?
                      <ChevronRight 
                        className={`h-4 w-4 transition-transform ${openExplanation === 'finalBalance' ? 'rotate-90' : ''}`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openExplanation === 'finalBalance' ? 'max-h-96 mt-3' : 'max-h-0'
                      }`}
                    >
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                        <p className="font-medium text-gray-900 mb-2">This is the total wealth accumulated at the end of the simulation period.</p>
                        <p className="mb-2">Final Balance = All your money after compound growth</p>
                        <p className="mb-1">Includes:</p>
                        <ul className="list-disc list-inside pl-2 space-y-1">
                          <li>Initial investment</li>
                          <li>Monthly contributions</li>
                          <li>Contribution growth</li>
                          <li>Compounded returns</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                        <Target className="h-5 w-5 text-secondary-600" />
                      </div>
                      <h3 className="text-lg font-semibold">Total Invested</h3>
                    </div>
                    <p className="text-2xl font-bold text-secondary-600 mb-2">
                      {formatCurrency(simulationData[simulationData.length - 1].contributions.toString())}
                    </p>
                    <button
                      onClick={() => toggleExplanation('totalInvested')}
                      className="text-sm text-secondary-600 hover:text-secondary-700 flex items-center gap-1"
                    >
                      What does this mean?
                      <ChevronRight 
                        className={`h-4 w-4 transition-transform ${openExplanation === 'totalInvested' ? 'rotate-90' : ''}`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openExplanation === 'totalInvested' ? 'max-h-96 mt-3' : 'max-h-0'
                      }`}
                    >
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                        <p className="font-medium text-gray-900 mb-2">This is the total amount you personally invested from your pocket.</p>
                        <p className="mb-2">Total Invested = Initial investment + Sum of all monthly contributions</p>
                        <div className="bg-white rounded-lg p-3 mt-2">
                          <p className="font-medium text-gray-900 mb-1">Example:</p>
                          <p>Initial = AU$100,000</p>
                          <p>Contributions over 30 years ≈ AU$1,350,154</p>
                          <p className="mt-1 font-medium">Total Invested = AU$1,450,154</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                        <ChevronRight className="h-5 w-5 text-accent-600" />
                      </div>
                      <h3 className="text-lg font-semibold">Total Returns</h3>
                    </div>
                    <p className="text-2xl font-bold text-accent-600 mb-2">
                      {formatCurrency(simulationData[simulationData.length - 1].returns.toString())}
                    </p>
                    <button
                      onClick={() => toggleExplanation('totalReturns')}
                      className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1"
                    >
                      What does this mean?
                      <ChevronRight 
                        className={`h-4 w-4 transition-transform ${openExplanation === 'totalReturns' ? 'rotate-90' : ''}`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openExplanation === 'totalReturns' ? 'max-h-96 mt-3' : 'max-h-0'
                      }`}
                    >
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                        <p className="font-medium text-gray-900 mb-2">This is your <em>real profit</em> — the money that grew from your investments.</p>
                        <p className="mb-4">Total Returns = Final Balance − Total Invested</p>
                        <div className="bg-white rounded-lg p-3">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-1">Metric</th>
                                <th className="text-left py-1">What it Means</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="py-1 font-medium">Final Balance</td>
                                <td className="py-1">Total wealth with compound growth</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-1 font-medium">Total Invested</td>
                                <td className="py-1">Everything you personally contributed</td>
                              </tr>
                              <tr>
                                <td className="py-1 font-medium">Total Returns</td>
                                <td className="py-1">Profit earned from investment growth</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Projections Table */}
                <div className="bg-white rounded-xl p-6 shadow-card mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">📈 Invest now and see how your money can grow every month!</h2>
                    <button
                      onClick={exportToCSV}
                      className="btn btn-outline flex items-center gap-2"
                    >
                      <Download className="h-5 w-5" />
                      Download as CSV
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Contribution</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monthly Income</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedData.map((row) => (
                          <tr key={row.month} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Month {row.month}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                              {formatCurrency(row.contribution.toString())}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-primary-600">
                              {formatCurrency(row.balance.toString())}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-success-600">
                              {formatCurrency(row.monthlyIncome.toString())}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="btn btn-outline"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="btn btn-outline"
                    >
                      Next
                      <ChevronRight className="h-5 w-5" />
                    </button>
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
                          formatter={(value) => [formatCurrency(value.toString()), undefined]}
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
                This will create a new goal to track your progress towards your investment target of {formatCurrency(simulationData[simulationData.length - 1].balance.toString())}.
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