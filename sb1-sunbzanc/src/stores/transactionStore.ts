import { create } from 'zustand';
import { formatISO } from 'date-fns';
import { Transaction, TaxType, isIncomeCategory } from '../types/transaction';

interface TaxEntry {
  id: string;
  date: string;
  amount: number;
  type: TaxType;
  notes?: string;
  userId: string;
}

interface TransactionState {
  transactions: Transaction[];
  taxEntries: TaxEntry[];
  isLoading: boolean;
  error: string | null;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addTaxEntry: (entry: Omit<TaxEntry, 'id'>) => Promise<void>;
  updateTaxEntry: (id: string, entry: Partial<TaxEntry>) => Promise<void>;
  deleteTaxEntry: (id: string) => Promise<void>;
  fetchTaxEntries: () => Promise<void>;
}

// Demo data for development
const demoTransactions: Transaction[] = [
  {
    id: '1',
    origin: 'Monthly Salary',
    amount: 3000,
    category: 'Income',
    date: formatISO(new Date(2025, 0, 1)),
    userId: 'demo-user',
  },
  {
    id: '2',
    origin: 'Apartment Rent',
    amount: 800,
    category: 'Fixed',
    date: formatISO(new Date(2025, 0, 5)),
    userId: 'demo-user',
  },
  {
    id: '3',
    origin: 'Groceries',
    amount: 120,
    category: 'Variable',
    date: formatISO(new Date(2025, 0, 10)),
    userId: 'demo-user',
  },
];

const demoTaxEntries: TaxEntry[] = [
  {
    id: '1',
    date: formatISO(new Date(2025, 0, 1)),
    amount: 500,
    type: 'Withheld',
    notes: 'January PAYG',
    userId: 'demo-user',
  },
  {
    id: '2',
    date: formatISO(new Date(2025, 0, 15)),
    amount: 1200,
    type: 'BAS',
    notes: 'Q4 2024 BAS Payment',
    userId: 'demo-user',
  },
];

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  taxEntries: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ transactions: demoTransactions, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch transactions', isLoading: false });
    }
  },

  addTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
      };
      
      set(state => ({
        transactions: [...state.transactions, newTransaction],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to add transaction', isLoading: false });
    }
  },

  updateTransaction: async (id, transaction) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        transactions: state.transactions.map(t => 
          t.id === id ? { ...t, ...transaction } : t
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update transaction', isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete transaction', isLoading: false });
    }
  },

  fetchTaxEntries: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ taxEntries: demoTaxEntries, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch tax entries', isLoading: false });
    }
  },

  addTaxEntry: async (entry) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newEntry = {
        ...entry,
        id: Date.now().toString(),
      };
      
      set(state => ({
        taxEntries: [...state.taxEntries, newEntry],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to add tax entry', isLoading: false });
    }
  },

  updateTaxEntry: async (id, entry) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        taxEntries: state.taxEntries.map(e => 
          e.id === id ? { ...e, ...entry } : e
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update tax entry', isLoading: false });
    }
  },

  deleteTaxEntry: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        taxEntries: state.taxEntries.filter(e => e.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete tax entry', isLoading: false });
    }
  },
}));