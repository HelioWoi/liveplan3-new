import { useState, useEffect } from 'react';
import { Check, AlertCircle, Eye, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { formatCurrency } from '../../utils/formatters';
import { TransactionCategory, TRANSACTION_CATEGORIES } from '../../types/transaction';

interface ColumnMapping {
  date: string;
  category: string;
  amount: string;
  description: string;
}

interface PreviewData {
  [key: string]: string;
}

interface SmartSpreadsheetConverterProps {
  file: File;
  onClose: () => void;
  onSuccess: (mappedData: any[]) => void;
}

export default function SmartSpreadsheetConverter({ file, onClose, onSuccess }: SmartSpreadsheetConverterProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: '',
    category: '',
    amount: '',
    description: '',
  });
  const [mappedData, setMappedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    parseFile();
  }, [file]);

  const parseFile = async () => {
    try {
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          preview: 10,
          complete: (results) => {
            const headers = results.meta.fields || [];
            setHeaders(headers);
            setPreviewData(results.data as PreviewData[]);
            setAutoMapping(headers);
          },
          error: (error) => {
            setError(`Failed to parse CSV file: ${error.message}`);
          }
        });
      } else if (file.name.match(/\.xlsx?$/)) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const headers = Object.keys(worksheet)
          .filter(key => key.match(/^[A-Z]1$/))
          .map(key => worksheet[key].v);
        
        setHeaders(headers);
        setPreviewData(XLSX.utils.sheet_to_json<PreviewData>(worksheet).slice(0, 10));
        setAutoMapping(headers);
      }
    } catch (error) {
      setError('Failed to parse file');
    }
  };

  const setAutoMapping = (headers: string[]) => {
    const autoMapping: ColumnMapping = {
      date: headers.find(h => /date|data/i.test(h)) || '',
      category: headers.find(h => /category|categoria|type|tipo/i.test(h)) || '',
      amount: headers.find(h => /amount|valor|price|preço/i.test(h)) || '',
      description: headers.find(h => /description|descrição|name|nome/i.test(h)) || '',
    };
    setMapping(autoMapping);
  };

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setMapping(prev => ({ ...prev, [field]: value }));
  };

  const validateMapping = (): boolean => {
    return Object.values(mapping).every(value => value !== '');
  };

  const processData = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const processed = await processFile();
      setMappedData(processed);
      setShowPreview(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process data');
    } finally {
      setIsProcessing(false);
    }
  };

  const processFile = async (): Promise<any[]> => {
    if (file.name.endsWith('.csv')) {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            try {
              resolve(processRows(results.data as PreviewData[]));
            } catch (error) {
              reject(error);
            }
          },
          error: reject
        });
      });
    } else if (file.name.match(/\.xlsx?$/)) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<PreviewData>(worksheet);
      return processRows(rows);
    }
    throw new Error('Unsupported file format');
  };

  const processRows = (rows: PreviewData[]): any[] => {
    return rows.map(row => {
      const date = new Date(row[mapping.date]);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${row[mapping.date]}`);
      }

      const amount = parseFloat(String(row[mapping.amount]).replace(/[^0-9.-]+/g, ''));
      if (isNaN(amount)) {
        throw new Error(`Invalid amount: ${row[mapping.amount]}`);
      }

      const description = row[mapping.description];
      if (!description) {
        throw new Error('Description is required');
      }

      const category = mapCategory(row[mapping.category]);

      return {
        date: date.toISOString(),
        category,
        amount,
        description,
        type: determineType(category),
      };
    });
  };

  const mapCategory = (value: string): TransactionCategory => {
    const normalized = value.toLowerCase().trim();
    const categoryMap: Record<string, TransactionCategory> = {
      'salary': 'Income',
      'wage': 'Income',
      'investment': 'Investimento',
      'rent': 'Fixed',
      'utilities': 'Fixed',
      'groceries': 'Variable',
      'food': 'Variable',
      'entertainment': 'Extra',
      'gift': 'Additional',
      'tax': 'Tax',
    };
    return categoryMap[normalized] || 'Variable';
  };

  const determineType = (category: TransactionCategory): 'income' | 'expense' => {
    return ['Income', 'Investimento'].includes(category) ? 'income' : 'expense';
  };

  const handleConfirm = () => {
    onSuccess(mappedData);
  };

  return (
    <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Map Your Spreadsheet Columns</h2>

      {!showPreview ? (
        <div className="space-y-8">
          {/* Column Mapping */}
          <div className="grid gap-6">
            {Object.entries(mapping).map(([field, value]) => (
              <div key={field} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {field} Column
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                  value={value}
                  onChange={(e) => handleMappingChange(field as keyof ColumnMapping, e.target.value)}
                >
                  <option value="">Select column</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Preview Table */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Data Preview</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {headers.map(header => (
                        <th key={header} className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previewData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {headers.map(header => (
                          <td key={header} className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={processData}
              disabled={!validateMapping() || isProcessing}
              className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Eye className="h-5 w-5 mr-2" />
                  Preview Result
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Mapped Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Review how your data will be imported into LivePlan³
            </p>

            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mappedData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(row.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.category}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">
                            {formatCurrency(row.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.type === 'income' 
                                ? 'bg-success-100 text-success-800' 
                                : 'bg-error-100 text-error-800'
                            }`}>
                              {row.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConfirm}
              className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center justify-center"
            >
              <Check className="h-5 w-5 mr-2" />
              Confirm Import
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Edit Mapping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
