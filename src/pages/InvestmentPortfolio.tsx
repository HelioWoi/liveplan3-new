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
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Calculator, Info, TrendingUp, Target, ChevronRight, HeartHandshake, Share2, Download, ChevronLeft } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';
import { formatCurrency } from '../utils/formatters';
import classNames from 'classnames';

// Replace direct Finnhub client with a fetch-based approach
const API_KEY = 'd08rfs1r01qju5m8a010d08rfs1r01qju5m8a01g';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

async function fetchQuote(symbol: string) {
  const response = await fetch(
    `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`
  );
  return response.json();
}

async function fetchMarketNews() {
  const response = await fetch(
    `${FINNHUB_BASE_URL}/news?category=general&token=${API_KEY}`
  );
  return response.json();
}

type Period = 'day' | 'week' | 'month' | 'year';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = ['2022', '2023', '2024', '2025'];

// Popular brokers list
const BROKERS = [
  { name: 'Stake', url: 'https://stake.com.au', description: 'Trade US stocks and ETFs' },
  { name: 'SelfWealth', url: 'https://www.selfwealth.com.au', description: 'Australian share trading platform' },
  { name: 'CommSec', url: 'https://www.commsec.com.au', description: 'Commonwealth Bank trading platform' },
  { name: 'eToro', url: 'https://www.etoro.com/en-au', description: 'Social trading and investment platform' },
];

// Watchlist stocks
const WATCHLIST_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
}

export default function InvestmentPortfolio() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showBrokersModal, setShowBrokersModal] = useState(false);
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [marketNews, setMarketNews] = useState<any[]>([]);

  // Simulator state
  const [initialInvestment, setInitialInvestment] = useState('10000');
  const [monthlyContribution, setMonthlyContribution] = useState('1000');
  const [expectedReturn, setExpectedReturn] = useState(8);
  const [investmentTerm, setInvestmentTerm] = useState(30);
  const [contributionGrowth, setContributionGrowth] = useState(3);

  // Calculate simulation results
  const calculateResults = () => {
    const initial = parseFloat(initialInvestment);
    const monthly = parseFloat(monthlyContribution);
    const years = investmentTerm;
    const rate = expectedReturn / 100;
    const growthRate = contributionGrowth / 100;

    let balance = initial;
    let totalContributions = initial;
    let monthlyAmount = monthly;
    const data = [];

    for (let year = 0; year <= years; year++) {
      const annualContribution = monthlyAmount * 12;
      const annualReturn = balance * rate;
      
      balance += annualContribution + annualReturn;
      totalContributions += annualContribution;
      monthlyAmount *= (1 + growthRate);

      data.push({
        year,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions),
        returns: Math.round(balance - totalContributions),
        monthlyIncome: Math.round(balance * 0.04 / 12) // 4% annual withdrawal rate
      });
    }

    return data;
  };

  const simulationData = calculateResults();
  const finalBalance = simulationData[simulationData.length - 1].balance;
  const monthlyIncome = simulationData[simulationData.length - 1].monthlyIncome;
  const totalReturns = simulationData[simulationData.length - 1].returns;
  const totalContributions = simulationData[simulationData.length - 1].contributions;

  useEffect(() => {
    // Fetch stock quotes
    const fetchQuotes = async () => {
      try {
        const quotesData = await Promise.all(
          WATCHLIST_SYMBOLS.map(async (symbol) => {
            const quote = await fetchQuote(symbol);
            return {
              symbol,
              price: quote.c,
              change: quote.d,
              percentChange: quote.dp
            };
          })
        );
        setQuotes(quotesData);
      } catch (error) {
        console.error('Error fetching quotes:', error);
      }
    };

    // Fetch market news
    const fetchNews = async () => {
      try {
        const news = await fetchMarketNews();
        setMarketNews(news.slice(0, 5));
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchQuotes();
    fetchNews();

    // Refresh quotes every minute
    const interval = setInterval(fetchQuotes, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Investment Portfolio" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Watchlist */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Market Watch</h2>
            <button
              onClick={() => setShowBrokersModal(true)}
              className="btn btn-primary"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Open Trading Account
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotes.map((quote) => (
              <div key={quote.symbol} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">{quote.symbol}</h3>
                  <span className={classNames(
                    "text-sm font-medium px-2 py-1 rounded-full",
                    quote.change >= 0 ? "bg-success-100 text-success-800" : "bg-error-100 text-error-800"
                  )}>
                    {quote.change >= 0 ? '+' : ''}{quote.percentChange.toFixed(2)}%
                  </span>
                </div>
                <p className="text-2xl font-bold">${quote.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} today
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Passive Income Simulator */}
        <div className="bg-white rounded-xl p-6 shadow-card mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Calculator className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Passive Income Simulator</h2>
                <p className="text-sm text-gray-500">Calculate your potential passive income</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/simulator')}
              className="btn btn-outline"
            >
              Advanced Simulation
              <ChevronRight className="h-5 w-5 ml-2" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Investment
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="text"
                    className="input pl-8"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Contribution
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="text"
                    className="input pl-8"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Annual Return (%)
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.1"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1%</span>
                  <span className="font-medium text-primary-600">{expectedReturn}%</span>
                  <span>15%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Contribution Growth (%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={contributionGrowth}
                  onChange={(e) => setContributionGrowth(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0%</span>
                  <span className="font-medium text-primary-600">{contributionGrowth}%</span>
                  <span>10%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Term (Years)
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={investmentTerm}
                  onChange={(e) => setInvestmentTerm(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>5 years</span>
                  <span className="font-medium text-primary-600">{investmentTerm} years</span>
                  <span>40 years</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">Projected Results</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Final Balance</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatCurrency(finalBalance)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Monthly Income</p>
                    <p className="text-2xl font-bold text-success-600">
                      {formatCurrency(monthlyIncome)}
                    </p>
                    <p className="text-xs text-gray-500">4% withdrawal rate</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total Invested</p>
                    <p className="text-2xl font-bold text-accent-600">
                      {formatCurrency(totalContributions)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total Returns</p>
                    <p className="text-2xl font-bold text-warning-600">
                      {formatCurrency(totalReturns)}
                    </p>
                  </div>
                </div>

                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simulationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        label={{ value: 'Years', position: 'insideBottomRight', offset: -10 }} 
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, undefined]}
                        labelFormatter={(label) => `Year ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        name="Total Balance"
                        stroke="#4F46E5"
                        fill="#4F46E5"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="contributions"
                        name="Total Invested"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg p-4 text-sm">
                  <p className="font-medium text-gray-900 mb-2">Investment Summary</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Initial Investment: {formatCurrency(Number(initialInvestment))}</li>
                    <li>• Monthly Contribution: {formatCurrency(Number(monthlyContribution))}</li>
                    <li>• Expected Return: {expectedReturn}% per year</li>
                    <li>• Contribution Growth: {contributionGrowth}% per year</li>
                    <li>• Investment Term: {investmentTerm} years</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market News */}
        <div className="bg-white rounded-xl p-6 shadow-card mt-6">
          <h2 className="text-xl font-bold mb-6">Market News</h2>
          <div className="space-y-4">
            {marketNews.map((news, index) => (
              <a
                key={index}
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:bg-gray-50 rounded-lg p-4 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {news.image && (
                    <img
                      src={news.image}
                      alt={news.headline}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{news.headline}</h3>
                    <p className="text-sm text-gray-500">{news.summary}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(news.datetime * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Brokers Modal */}
        {showBrokersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Choose Your Trading Platform</h2>
                <button
                  onClick={() => setShowBrokersModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BROKERS.map((broker) => (
                  <a
                    key={broker.name}
                    href={broker.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <h3 className="text-lg font-bold mb-2">{broker.name}</h3>
                    <p className="text-gray-600 mb-4">{broker.description}</p>
                    <div className="flex items-center text-primary-600">
                      <span className="font-medium">Open Account</span>
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </div>
                  </a>
                ))}
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Note: LivePlan³ is not affiliated with any of these platforms. Please research and compare before choosing a broker.
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
