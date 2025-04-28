import { Transaction } from '../types/transaction';
import Papa from 'papaparse';

interface SpreadsheetRow {
  Date: string;
  Type: string;
  Category: string;
  Description: string;
  Amount: string | number;
}

export const validateSpreadsheetFormat = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const requiredHeaders = ['Date', 'Type', 'Category', 'Description', 'Amount'];
        const headers = results.meta.fields || [];
        
        const hasAllHeaders = requiredHeaders.every(header => 
          headers.includes(header)
        );

        resolve(hasAllHeaders);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const parseSpreadsheet = (file: File): Promise<Partial<Transaction>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const transactions: Partial<Transaction>[] = results.data
            .map((row: SpreadsheetRow) => {
              // Validate date format
              const date = new Date(row.Date);
              if (isNaN(date.getTime())) {
                throw new Error(`Invalid date format in row: ${JSON.stringify(row)}`);
              }

              // Parse amount
              const amount = typeof row.Amount === 'string' ? 
                parseFloat(row.Amount.replace(/[^0-9.-]+/g, '')) : 
                row.Amount;

              if (isNaN(amount)) {
                throw new Error(`Invalid amount format in row: ${JSON.stringify(row)}`);
              }

              // Map spreadsheet categories to app categories
              const category = mapCategory(row.Category);
              const type = determineType(row.Type);

              return {
                date: date.toISOString(),
                origin: row.Description,
                amount,
                category,
                type
              };
            })
            .filter(t => t !== null);

          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

const mapCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'Salary': 'Income',
    'Rent': 'Fixed',
    'Groceries': 'Variable',
    'Gift': 'Extra',
    'Bonus': 'Additional',
    'Income Tax': 'Tax',
    // Add more mappings as needed
  };

  return categoryMap[category] || category;
};

const determineType = (type: string): 'income' | 'expense' => {
  const incomeTypes = ['Income', 'Salary', 'Bonus', 'Investment'];
  return incomeTypes.includes(type) ? 'income' : 'expense';
};

export const generateTemplateFile = (): string => {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
  const sampleData = [
    ['2025-01-01', 'Income', 'Salary', 'Monthly salary', '5000'],
    ['2025-01-03', 'Fixed Expen', 'Rent', 'Apartment rent', '1500'],
    ['2025-01-05', 'Investments', 'Groceries', 'Supermarket', '300'],
    ['2025-01-08', 'Extras', 'Gift', 'Investment deposit', '400'],
    ['2025-01-10', 'Additional', 'Bonus', 'Year-end bonus', '2000'],
    ['2025-01-15', 'Tax', 'Income Tax', 'Government tax', '800']
  ];

  const csv = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');

  return csv;
};