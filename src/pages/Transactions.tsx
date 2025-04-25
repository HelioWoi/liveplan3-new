import { useEffect, useState } from 'react';
import { useTransactionStore } from '../stores/transactionStore'; // Mantendo o nome do store, pois não foi pedido para mudar
import { format } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle, Download, FilterX, PlusCircle, Search, Trash2 } from 'lucide-react';
import TransactionForm from '../components/forms/TransactionForm'; // Mantendo o nome do componente, pois não foi pedido para mudar
import BottomNavigation from '../components/layout/BottomNavigation';
import PageHeader from '../components/layout/PageHeader';
import { TransactionCategory, isIncomeCategory } from '../types/transaction'; // Mantendo os tipos, pois não foi pedido para mudar
import { formatCurrency } from '../utils/formatters';

// Mudança do nome do componente/página
export default function Statement() {
  // Renomeando a variável que recebe os dados de 'transactions' para 'statements'
  // Mantendo os nomes das actions do store ('fetchTransactions', 'deleteTransaction')
  const { transactions: statements, fetchTransactions, deleteTransaction } = useTransactionStore();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | 'all'>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter statements based on search and filters - Mudança no comentário
  const filteredStatements = statements.filter(statement => { // Renomeando 'transactions' para 'statements' e 'transaction' para 'statement'
    const matchesSearch = (statement.origin || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || statement.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Sort statements by date (newest first) - Mudança no comentário
  const sortedStatements = [...filteredStatements] // Renomeando 'filteredTransactions' para 'filteredStatements'
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Renomeando a função
  const handleDeleteStatement = async (id: string) => {
    setIsDeleting(id);

    try {
      await deleteTransaction(id); // Mantendo a action do store
    } catch (error) {
      console.error('Failed to delete statement', error); // Mudança na mensagem de erro
    } finally {
      setIsDeleting(null);
    }
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Date', 'Origin', 'Amount', 'Category'];
    const csvContent = [
      headers.join(','),
      // Renomeando 'sortedTransactions' para 'sortedStatements' e 't' para 'statement'
      ...sortedStatements.map(statement => [
        format(new Date(statement.date), 'yyyy-MM-dd'),
        `"${(statement.origin || '').replace(/"/g, '""')}"`,
        statement.amount,
        statement.category
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Mudando o nome do arquivo CSV
    link.setAttribute('download', `statement_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
  };

  const getCategoryBadgeClass = (category: string) => {
    const baseClass = 'text-xs font-medium px-2 py-1 rounded';
    switch (category) {
      case 'Fixed':
        return `${baseClass} bg-secondary-100 text-secondary-800`;
      case 'Variable':
        return `${baseClass} bg-accent-100 text-accent-800`;
      case 'Income':
      case 'Investimento':
        return `${baseClass} bg-success-100 text-success-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  // Get recent statements for the summary section - Mudança no comentário
  // Renomeando 'sortedTransactions' para 'sortedStatements' e 'recentTransactions' para 'recentStatements'
  const recentStatements = sortedStatements.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader
        title="Statement" // Mudança no título
        showBackButton={false}
        showMoreOptions={true}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Recent Statements Summary - Mudança no comentário e título */}
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <h2 className="text-xl font-bold mb-4">Recent Statement</h2> {/* Mudança no título */}
          <div className="space-y-4">
            {/* Renomeando 'recentTransactions' para 'recentStatements' e 'transaction' para 'statement' */}
            {recentStatements.map(statement => (
              <div key={statement.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isIncomeCategory(statement.category) ? 'bg-success-100' : 'bg-error-100'
                  }`}>
                    {isIncomeCategory(statement.category) ? (
                      <ArrowUpCircle className="h-5 w-5 text-success-600" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-error-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{statement.origin}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(statement.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-medium ${
                    isIncomeCategory(statement.category) ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {isIncomeCategory(statement.category) ? '+' : '-'}{formatCurrency(statement.amount)}
                  </span>
                  <div className="mt-1">
                    <span className={getCategoryBadgeClass(statement.category)}>
                      {statement.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex gap-2">
            <button
              className="btn btn-primary flex-1 sm:flex-none"
              onClick={() => setShowForm(true)}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add New {/* Mantido "Add New", mas o modal abaixo será alterado */}
            </button>
            <button
              className="btn btn-outline flex-1 sm:flex-none"
              onClick={exportToCSV}
            >
              <Download className="h-5 w-5 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Search statement..." // Mudança no placeholder
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <select
                className="input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as TransactionCategory | 'all')}
              >
                <option value="all">All Categories</option>
                <option value="Income">Income</option>
                <option value="Investimento">Investment</option>
                <option value="Fixed">Fixed</option>
                <option value="Variable">Variable</option>
                <option value="Extra">Extra</option>
                <option value="Additional">Additional</option>
                <option value="Tax">Tax</option>
              </select>
            </div>
          </div>

          {(searchTerm || categoryFilter !== 'all') && (
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {/* Mudança na mensagem e renomeando variáveis */}
                Showing {sortedStatements.length} of {statements.length} statements
              </p>
              <button
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                onClick={clearFilters}
              >
                <FilterX className="h-4 w-4 mr-1" />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Statement List - Mudança no comentário */}
        <div className="bg-white rounded-xl overflow-hidden shadow-card">
          {/* Renomeando 'sortedTransactions' para 'sortedStatements' */}
          {sortedStatements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Renomeando 'sortedTransactions' para 'sortedStatements' e 'transaction' para 'statement' */}
                  {sortedStatements.map(statement => (
                    <tr key={statement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(statement.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {statement.origin || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getCategoryBadgeClass(statement.category)}>
                          {statement.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <span className={isIncomeCategory(statement.category) ? 'text-success-600' : 'text-error-600'}>
                          {isIncomeCategory(statement.category) ? '+' : '-'}{formatCurrency(statement.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          // Renomeando a função chamada e o ID check
                          onClick={() => handleDeleteStatement(statement.id)}
                          disabled={isDeleting === statement.id}
                          className="text-error-600 hover:text-error-800"
                        >
                          {isDeleting === statement.id ? (
                            'Deleting...'
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500 mb-4">No statements found</p> {/* Mudança na mensagem */}
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                 Add Statement {/* Mudança no botão */}
              </button>
            </div>
          )}
        </div>

        {/* Transaction Form Modal - Mantendo o nome do componente, mas mudando o título */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
              <h2 className="text-xl font-bold mb-4">Add New Statement</h2> {/* Mudança no título */}
              <TransactionForm // Mantendo o nome do componente
                onSuccess={() => setShowForm(false)}
              />
              <button
                className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <BottomNavigation />
      </div>
    </div>
  );
}