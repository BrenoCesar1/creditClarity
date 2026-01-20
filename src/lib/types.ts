export interface Card {
  id: string;
  name: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'elo';
  last4: string;
  expiry: string;
  userId: string;
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
  userId: string;
}

export interface Debt {
  id: string;
  person: string;
  avatarUrl: string;
  amount: number;
  reason: string;
  paid: boolean;
  date: string;
  userId: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
