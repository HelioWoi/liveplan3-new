import { useState, useEffect } from 'react';
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
import { Calculator, Info } from 'lucide-react';

interface RetirementData {
  age: number;
  balance: number;
  contribution: number;
  interest: number;
  totalContributions: number;
  totalInterest: number;
}

export default function RetirementCalculator() {
  // Form state
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(25000);
  const [annualContribution, setAnnualContribution] = useState(6000);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [inflationRate, setInflationRate] = useState(2.5);
  
  // Results
  const [projectionData, setProjectionData] = useState<RetirementData[]>([]);
  const [finalBalance, setFinalBalance] = useState(0);
  const [totalContributions, setTotalContributions] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  
  useEffect(() => {
    calculateRetirement();
  }, [currentAge, retirementAge, currentSavings, annualContribution, expectedReturn, inflationRate]);
  
  const calculateRetirement = () => {
    const years = retirementAge - currentAge;
    if (years <= 0) return;
    
    const data: RetirementData[] = [];
    let balance = currentSavings;
    let totalCont = 0;
    let totalInt = 0;
    
    const realReturn = (1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1;
    
    for (let i = 0; i <= years; i++) {
      const age = currentAge + i;
      const startBalance = balance;
      
      const contribution = i === 0 ? 0 : annualContribution;
      balance += contribution;
      
      const interest = balance * realReturn;
      balance += interest;
      
      totalCont += contribution;
      totalInt += interest;
      
      data.push({
        age,
        balance: Math.round(balance),
        contribution,
        interest: Math.round(interest),
        totalContributions: Math.round(totalCont),
        totalInterest: Math.round(totalInt),
      });
    }
    
    setProjectionData(data);
    setFinalBalance(balance);
    setTotalContributions(totalCont);
    setTotalInterest(totalInt);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold sm:text-3xl mb-6">Retirement Calculator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-primary-600" />
              Your Information
            </h2>
            
            <div className="space-y-4">
              <div className="form-group">
                <label htmlFor="currentAge" className="label">Current Age</label>
                <input
                  id="currentAge"
                  type="number"
                  min="18"
                  max="80"
                  className="input"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="retirementAge" className="label">Retirement Age</label>
                <input
                  id="retirementAge"
                  type="number"
                  min={currentAge + 1}
                  max="90"
                  className="input"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(Number(e.target.value))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="currentSavings" className="label">Current Savings ($)</label>
                <input
                  id="currentSavings"
                  type="number"
                  min="0"
                  className="input"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(Number(e.target.value))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="annualContribution" className="label">Annual Contribution ($)</label>
                <input
                  id="annualContribution"
                  type="number"
                  min="0"
                  className="input"
                  value={annualContribution}
                  onChange={(e) => setAnnualContribution(Number(e.target.value))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="expectedReturn" className="label">Expected Annual Return (%)</label>
                <input
                  id="expectedReturn"
                  type="number"
                  min="0"
                  max="15"
                  step="0.1"
                  className="input"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="inflationRate" className="label">Inflation Rate (%)</label>
                <input
                  id="inflationRate"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  className="input"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                />
              </div>
            </div>
            
            <div className="mt-6 bg-primary-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-primary-800">
                  The calculator uses an inflation-adjusted return rate to show values in today's dollars. This helps you understand the real purchasing power of your savings.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Retirement Projection</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-primary-50 rounded-lg p-4">
                <p className="text-primary-600 text-sm font-medium">Projected Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(finalBalance)}</p>
              </div>
              <div className="bg-secondary-50 rounded-lg p-4">
                <p className="text-secondary-600 text-sm font-medium">Total Contributions</p>
                <p className="text-2xl font-bold">{formatCurrency(totalContributions)}</p>
              </div>
              <div className="bg-accent-50 rounded-lg p-4">
                <p className="text-accent-600 text-sm font-medium">Interest Earned</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInterest)}</p>
              </div>
            </div>
            
            <div className="h-80">
              {projectionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={projectionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="age" 
                      label={{ value: 'Age', position: 'insideBottomRight', offset: -10 }} 
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      label={{ value: 'Balance', angle: -90, position: 'insideLeft' }} 
                    />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, undefined]}
                      labelFormatter={(label) => `Age: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      name="Retirement Balance"
                      stroke="#4F46E5" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalContributions" 
                      name="Total Contributions"
                      stroke="#10B981" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Please enter valid retirement data</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Detailed Projections by Age</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Age</th>
                      <th className="px-4 py-2 text-right">Balance</th>
                      <th className="px-4 py-2 text-right">Annual Contribution</th>
                      <th className="px-4 py-2 text-right">Interest Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectionData.filter((_, index) => index % 5 === 0 || index === projectionData.length - 1).map((data) => (
                      <tr key={data.age} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2">{data.age}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(data.balance)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(data.contribution)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(data.interest)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}