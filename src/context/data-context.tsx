'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Card, Transaction, Debt } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface DataContextType {
  cards: Card[];
  transactions: Transaction[];
  debts: Debt[];
  addCard: (card: Omit<Card, 'id'>) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Omit<Card, 'id'>>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id' | 'paid' | 'date'>) => Promise<void>;
  updateDebt: (debtId: string, updates: Partial<Omit<Debt, 'id'>>) => Promise<void>;
  deleteDebt: (debtId: string) => Promise<void>;
  updateTransaction: (transactionId: string, updates: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const calculateInstallments = (transactions: Transaction[], cards: Card[]): Transaction[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return transactions.map(tx => {
        if (!tx.installments || tx.installments.current >= tx.installments.total) {
            return tx;
        }

        const card = cards.find(c => c.id === tx.cardId);
        if (!card || !card.dueDate) {
            return tx;
        }

        // Use closing date if available, otherwise fallback to 10 days before due date
        const closingDay = card.closingDate || card.dueDate - 10;
        if (closingDay <= 0) return tx;

        const purchaseDate = new Date(tx.date);
        purchaseDate.setHours(0, 0, 0, 0);

        const dueDay = card.dueDate;
        const purchaseYear = purchaseDate.getFullYear();
        const purchaseMonth = purchaseDate.getMonth();
        
        // Determine the due date of the first invoice containing this purchase
        const closingDateOfPurchaseMonth = new Date(purchaseYear, purchaseMonth, closingDay);
        
        let firstInvoiceDueDate;
        if (purchaseDate <= closingDateOfPurchaseMonth) {
            // Purchase made on or before this month's closing date. Due next month.
            firstInvoiceDueDate = new Date(purchaseYear, purchaseMonth + 1, dueDay);
        } else {
            // Purchase made after this month's closing date. Due the month after next.
            firstInvoiceDueDate = new Date(purchaseYear, purchaseMonth + 2, dueDay);
        }
        firstInvoiceDueDate.setHours(0, 0, 0, 0);

        let paidCount = 0;
        let cursor = new Date(firstInvoiceDueDate);

        // Count how many due dates have passed or are today
        while (cursor <= today && paidCount < tx.installments.total) {
            paidCount++;
            cursor.setMonth(cursor.getMonth() + 1);
        }

        // Only update if the calculated current installment is greater than what's in the sheet
        if (paidCount > (tx.installments.current || 0) && paidCount <= tx.installments.total) {
            return {
                ...tx,
                installments: {
                    ...tx.installments,
                    current: paidCount
                }
            };
        }

        return tx;
    });
};


export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
        setLoading(true);
        setError(null);
        try {
            const responses = await Promise.all([
                fetch('/api/data/cards'),
                fetch('/api/data/transactions'),
                fetch('/api/data/debts'),
            ]);

            for (const res of responses) {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Falha ao buscar dados da planilha.');
                }
            }

            const [cardsData, transactionsData, debtsData] = await Promise.all(responses.map(res => res.json()));
            
            const loadedCards = Array.isArray(cardsData) ? cardsData : [];
            const loadedTransactions = Array.isArray(transactionsData) ? transactionsData : [];
            
            const transactionsWithCalculatedInstallments = calculateInstallments(loadedTransactions, loadedCards);

            const originalTxMap = new Map(loadedTransactions.map(tx => [tx.id, tx]));
            const updatesToPersist: { id: string; updates: Partial<Omit<Transaction, 'id'>> }[] = [];

            transactionsWithCalculatedInstallments.forEach(newTx => {
                const oldTx = originalTxMap.get(newTx.id);
                if (newTx.installments && oldTx?.installments && newTx.installments.current !== oldTx.installments.current) {
                    updatesToPersist.push({ id: newTx.id, updates: { installments: newTx.installments } });
                }
            });

            setCards(loadedCards);
            setTransactions(transactionsWithCalculatedInstallments.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setDebts(Array.isArray(debtsData) ? debtsData : []);

            if (updatesToPersist.length > 0) {
                Promise.all(updatesToPersist.map(update => 
                    fetch('/api/data/transactions', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: update.id, updates: update.updates }),
                    })
                )).catch(err => {
                    console.log("Failed to persist installment updates in background:", err);
                });
            }

        } catch (err: any) {
            console.error("Failed to load data from API", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, []);

  const addCard = async (card: Omit<Card, 'id'>) => {
    const response = await fetch('/api/data/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card),
    });
    const newCard = await response.json();
    setCards(prev => [...prev, newCard]);
  };

  const updateCard = async (cardId: string, updates: Partial<Omit<Card, 'id'>>) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...updates } as Card : c));
    await fetch('/api/data/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cardId, updates }),
    });
  };

  const deleteCard = async (cardId: string) => {
      setCards(prev => prev.filter(c => c.id !== cardId));
      setTransactions(prev => prev.filter(t => t.cardId !== cardId));
      await fetch(`/api/data/cards?id=${cardId}`, {
          method: 'DELETE',
      });
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const response = await fetch('/api/data/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
    });
    const newTransaction = await response.json();
    setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const addDebt = async (debt: Omit<Debt, 'id' | 'paid' | 'date'>) => {
    const fullDebt: Omit<Debt, 'id'> = {
        ...debt,
        paid: false,
        date: new Date().toISOString(),
        avatarUrl: `https://picsum.photos/seed/${debt.person.replace(/\s/g, '')}/40/40`,
    };
    const response = await fetch('/api/data/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullDebt),
    });
    const newDebt = await response.json();
    setDebts(prev => [...prev, newDebt]);
  };
  
  const updateDebt = async (debtId: string, updates: Partial<Omit<Debt, 'id'>>) => {
    // Optimistic update
    setDebts(prev => prev.map(d => {
        if (d.id === debtId) {
            const newDebt = { ...d, ...updates };
            // Recalculate avatar if person changes
            if (updates.person) {
                newDebt.avatarUrl = `https://picsum.photos/seed/${updates.person.replace(/\s/g, '')}/40/40`;
            }
            return newDebt;
        }
        return d;
    }));
    // API call
    await fetch('/api/data/debts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: debtId, updates }),
    });
  };

  const deleteDebt = async (debtId: string) => {
    setDebts(prev => prev.filter(d => d.id !== debtId));
    await fetch(`/api/data/debts?id=${debtId}`, {
        method: 'DELETE',
    });
  };

  const updateTransaction = async (transactionId: string, updates: Partial<Omit<Transaction, 'id'>>) => {
      setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, ...updates } : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      await fetch('/api/data/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transactionId, updates }),
      });
  };

  const deleteTransaction = async (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
    await fetch(`/api/data/transactions?id=${transactionId}`, {
        method: 'DELETE',
    });
  };

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando dados da sua planilha...</p>
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background p-4">
            <div className="flex max-w-lg flex-col items-center gap-4 rounded-lg border border-destructive bg-card p-8 text-center">
                <h2 className="text-xl font-semibold text-destructive">Erro de Conexão com a Planilha</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{error}</p>
            </div>
        </div>
    );
  }

  return (
    <DataContext.Provider value={{ cards, transactions, debts, addCard, updateCard, deleteCard, addTransaction, addDebt, updateDebt, deleteDebt, updateTransaction, deleteTransaction, loading }}>
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
