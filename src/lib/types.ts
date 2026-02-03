export interface Card {
  id: string;
  name: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'elo';
  last4: string;
  expiry: string;
  dueDate: number;
  closingDate: number;
}

export interface Transaction {
  id: string;
  cardId: string;
  description: string;
  amount: number;
  date: string;
  category?: 'Alimentação' | 'Transporte' | 'Lazer' | 'Contas' | 'Outros';
  installments?: {
    current: number;
    total: number;
  };
}

export interface Debt {
  id: string;
  person: string;
  avatarUrl: string;
  amount: number;
  reason: string;
  paid: boolean;
  date: string;
  installments?: {
    current: number;
    total: number;
  };
}
