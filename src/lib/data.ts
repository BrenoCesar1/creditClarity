import type { Card, Transaction, Debt } from './types';

export const cards: Card[] = [
  {
    id: 'card-1',
    name: 'Cartão Principal',
    brand: 'visa',
    last4: '1234',
    expiry: '12/26',
  },
  {
    id: 'card-2',
    name: 'Cartão de Compras',
    brand: 'mastercard',
    last4: '5678',
    expiry: '08/25',
  },
  {
    id: 'card-3',
    name: 'Cartão Reserva',
    brand: 'elo',
    last4: '9012',
    expiry: '02/28',
  },
];

export const transactions: Transaction[] = [
  {
    id: 'txn-1',
    cardId: 'card-1',
    description: 'iFood',
    amount: 45.9,
    date: '2024-07-20T19:30:00Z',
    category: 'Alimentação',
  },
  {
    id: 'txn-2',
    cardId: 'card-1',
    description: 'Uber Viagem',
    amount: 22.5,
    date: '2024-07-20T18:00:00Z',
    category: 'Transporte',
  },
  {
    id: 'txn-3',
    cardId: 'card-2',
    description: 'Compra na Amazon',
    amount: 150.0,
    date: '2024-07-19T14:10:00Z',
    installments: { current: 1, total: 3 },
  },
  {
    id: 'txn-4',
    cardId: 'card-1',
    description: 'Cinema Ingresso',
    amount: 55.0,
    date: '2024-07-18T21:00:00Z',
    category: 'Lazer',
  },
  {
    id: 'txn-5',
    cardId: 'card-3',
    description: 'Conta de Luz',
    amount: 120.75,
    date: '2024-07-15T10:00:00Z',
    category: 'Contas',
  },
  {
    id: 'txn-6',
    cardId: 'card-2',
    description: 'Supermercado Pão de Açucar',
    amount: 320.4,
    date: '2024-07-14T11:45:00Z',
  },
  {
    id: 'txn-7',
    cardId: 'card-1',
    description: 'Assinatura Spotify',
    amount: 21.9,
    date: '2024-07-10T08:00:00Z',
    category: 'Lazer',
  },
  {
    id: 'txn-8',
    cardId: 'card-2',
    description: 'Abastecimento Posto Ipiranga',
    amount: 180.0,
    date: '2024-06-28T17:20:00Z',
  },
  {
    id: 'txn-9',
    cardId: 'card-1',
    description: 'Restaurante Fogo de Chão',
    amount: 250.0,
    date: '2024-06-25T20:15:00Z',
  },
  {
    id: 'txn-10',
    cardId: 'card-1',
    description: 'Compra de Roupas Zara',
    amount: 450.0,
    date: '2024-05-30T16:00:00Z',
    installments: { current: 3, total: 5 },
  },
  {
    id: 'txn-11',
    cardId: 'card-3',
    description: 'Netflix',
    amount: 39.90,
    date: '2024-05-05T00:00:00Z',
    category: 'Lazer',
  }
];

export const debts: Debt[] = [
  {
    id: 'debt-1',
    person: 'João Silva',
    avatarUrl: 'https://picsum.photos/seed/joao/40/40',
    amount: 150.0,
    reason: 'Compra na Amazon',
    paid: false,
    date: '2024-07-19T14:10:00Z',
  },
  {
    id: 'debt-2',
    person: 'Maria Oliveira',
    avatarUrl: 'https://picsum.photos/seed/maria/40/40',
    amount: 55.0,
    reason: 'Ingresso do cinema',
    paid: false,
    date: '2024-07-18T21:00:00Z',
  },
  {
    id: 'debt-3',
    person: 'Carlos Pereira',
    avatarUrl: 'https://picsum.photos/seed/carlos/40/40',
    amount: 250.0,
    reason: 'Jantar Fogo de Chão',
    paid: true,
    date: '2024-06-25T20:15:00Z',
  },
];
