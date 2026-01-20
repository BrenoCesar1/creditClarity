'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Card, Transaction, Debt } from '@/lib/types';

// Mock initial data as if loaded from a spreadsheet
const initialCards: Card[] = [];
const initialTransactions: Transaction[] = [];
const initialDebts: Debt[] = [];

interface DataContextType {
  cards: Card[];
  transactions: Transaction[];
  debts: Debt[];
  addCard: (card: Omit<Card, 'id'>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (debtId: string, updates: Partial<Debt>) => void;
  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [debts, setDebts] = useState<Debt[]>(initialDebts);

  const addCard = (card: Omit<Card, 'id'>) => {
    setCards(prev => [...prev, { ...card, id: Date.now().toString() }]);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: Date.now().toString() }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const addDebt = (debt: Omit<Debt, 'id'>) => {
    setDebts(prev => [...prev, { ...debt, id: Date.now().toString() }]);
  };
  
  const updateDebt = (debtId: string, updates: Partial<Debt>) => {
    setDebts(prev => prev.map(d => d.id === debtId ? { ...d, ...updates } : d));
  };

  const updateTransaction = (transactionId: string, updates: Partial<Transaction>) => {
      setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, ...updates } : t));
  };


  return (
    <DataContext.Provider value={{ cards, transactions, debts, addCard, addTransaction, addDebt, updateDebt, updateTransaction }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
