export type TransactionCategory = 
  | 'Income'
  | 'Investimento'
  | 'Fixed'
  | 'Variable'
  | 'Extra'
  | 'Additional'
  | 'Tax';

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  'Income',
  'Investimento',
  'Fixed',
  'Variable',
  'Extra',
  'Additional',
  'Tax'
];

export type TaxType = 'Withheld' | 'BAS' | 'PAYG' | 'Other';

export const TAX_TYPES: TaxType[] = ['Withheld', 'BAS', 'PAYG', 'Other'];

export interface Transaction {
  id: string;
  origin: string;
  amount: number;
  category: TransactionCategory;
  date: string;
  userId: string;
}

export const isIncomeCategory = (category: TransactionCategory): boolean => {
  return ['Income', 'Investimento'].includes(category);
};

export const getCategoryForFormula = (category: TransactionCategory) => {
  switch (category) {
    case 'Income':
      return 'income';
    case 'Investimento':
      return 'investment';
    case 'Fixed':
      return 'fixed';
    case 'Variable':
      return 'variable';
    case 'Extra':
      return 'extra';
    case 'Additional':
      return 'additional';
    case 'Tax':
      return 'tax';
  }
};

export const getCategoryColor = (category: TransactionCategory) => {
  switch (category) {
    case 'Income':
      return 'bg-success-100 text-success-800';
    case 'Investimento':
      return 'bg-primary-100 text-primary-800';
    case 'Fixed':
      return 'bg-secondary-100 text-secondary-800';
    case 'Variable':
      return 'bg-accent-100 text-accent-800';
    case 'Extra':
      return 'bg-warning-100 text-warning-800';
    case 'Additional':
      return 'bg-error-100 text-error-800';
    case 'Tax':
      return 'bg-gray-100 text-gray-800';
  }
};