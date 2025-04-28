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
          preview: 10, // Preview first 10 rows
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
        
        // Get headers from first row
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        const headers: string[] = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })];
          headers.push(cell?.v || `Column ${col + 1}`);
        }
        
        // Get preview data (first 10 rows)
        const rows = XLSX.utils.sheet_to_json<PreviewData>(worksheet, { 
          header: headers,
          range: 1, // Skip header row
          defval: '' // Default value for empty cells
        });
        
        setHeaders(headers);
        setPreviewData(rows.slice(0, 10));
        setAutoMapping(headers);
      } else {
        setError('Unsupported file format. Please use CSV or Excel files.');
      }
    } catch (error) {
      setError(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const setAutoMapping = (headers: string[]) => {
    // Try to auto-map columns based on common names
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
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            const processed = processRows(results.data as PreviewData[]);
            setMappedData(processed);
            setShowPreview(true);
          },
          error: (error) => {
            throw new Error(`Failed to process CSV file: ${error.message}`);
          }
        });
      } else if (file.name.match(/\.xlsx?$/)) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<PreviewData>(worksheet);
        const processed = processRows(rows);
        setMappedData(processed);
        setShowPreview(true);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process data');
    } finally {
      setIsProcessing(false);
    }
  };

  const processRows = (rows: PreviewData[]) => {
    return rows.map(row => {
      // Get values using the mapping
      const date = new Date(row[mapping.date]);
      const category = mapCategory(row[mapping.category]);
      const amount = parseFloat(String(row[mapping.amount]).replace(/[^0-9.-]+/g, ''));
      const description = row[mapping.description];

      // Validate values
      if (isNaN(date.getTime())) throw new Error(`Invalid date: ${row[mapping.date]}`);
      if (isNaN(amount)) throw new Error(`Invalid amount: ${row[mapping.amount]}`);
      if (!description) throw new Error('Description is required');

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
    
    // Map common categories to app categories
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
    <div className="bg-white rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6">Map Your Spreadsheet Columns</h2>

      {!showPreview ? (
        <>
          <div className="space-y-6 mb-8">
            {/* Column Mapping */}
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Column
                </label>
                <select
                  className="input w-full"
                  value={mapping.date}
                  onChange={(e) => handleMappingChange('date', e.target.value)}
                >
                  <option value="">Select column</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Column
                </label>
                <select
                  className="input w-full"
                  value={mapping.category}
                  onChange={(e) => handleMappingChange('category', e.target.value)}
                >
                  <option value="">Select column</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Column
                </label>
                <select
                  className="input w-full"
                  value={mapping.amount}
                  onChange={(e) => handleMappingChange('amount', e.target.value)}
                >
                  <option value="">Select column</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description Column
                </label>
                <select
                  className="input w-full"
                  value={mapping.description}
                  onChange={(e) => handleMappingChange('description', e.target.value)}
                >
                  <option value="">Select column</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview Table */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Data Preview</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      {headers.map(header => (
                        <th key={header} className="p-2 border-b">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 3).map((row, i) => (
                      <tr key={i}>
                        {headers.map(header => (
                          <td key={header} className="p-2 border-b">
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
            <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start gap-3 mb-6">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={processData}
              disabled={!validateMapping() || isProcessing}
              className="btn btn-primary flex-1"
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
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Preview Mapped Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Review how your data will be imported into LivePlan³
            </p>

            <div className="overflow-x-auto bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-2 border-b">Date</th>
                    <th className="p-2 border-b">Category</th>
                    <th className="p-2 border-b">Description</th>
                    <th className="p-2 border-b text-right">Amount</th>
                    <th className="p-2 border-b">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {mappedData.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      <td className="p-2 border-b">
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                      <td className="p-2 border-b">{row.category}</td>
                      <td className="p-2 border-b">{row.description}</td>
                      <td className="p-2 border-b text-right">
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="p-2 border-b">
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

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="btn btn-primary flex-1"
            >
              <Check className="h-5 w-5 mr-2" />
              Confirm Import
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="btn btn-outline flex-1"
            >
              Edit Mapping
            </button>
          </div>
        </>
      )}
    </div>
  );
}
