import { google } from 'googleapis';
import type { Card, Transaction, Debt } from './types';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

const getAuth = () => {
    const credentials = {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return auth;
};

const getSheets = () => {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
};

// --- Generic Functions ---

async function getSheetData(sheetName: string): Promise<any[][]> {
    const sheets = getSheets();
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: sheetName,
        });
        return response.data.values || [];
    } catch (error) {
        console.error(`Error fetching data from ${sheetName}:`, error);
        // If the sheet is empty, it might throw an error. Return empty array with headers.
        if ((error as any).code === 400) {
            return [];
        }
        throw error;
    }
}

async function appendSheetData(sheetName: string, values: any[]) {
    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [values],
        },
    });
}

async function updateSheetCell(sheetName: string, rowIndex: number, colIndex: number, value: any) {
    const sheets = getSheets();
    const colLetter = String.fromCharCode('A'.charCodeAt(0) + colIndex);
    const range = `${sheetName}!${colLetter}${rowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[value]],
      },
    });
}

// --- Specific Functions ---

// Cards
export async function getCards(): Promise<Card[]> {
    const data = await getSheetData('cards');
    if (data.length < 2) return [];
    const headers = data[0] || [];
    return data.slice(1).map(row => ({
        id: row[headers.indexOf('id')],
        name: row[headers.indexOf('name')],
        brand: row[headers.indexOf('brand')] as Card['brand'],
        last4: row[headers.indexOf('last4')],
        expiry: row[headers.indexOf('expiry')],
    }));
}

export async function addCardToSheet(card: Omit<Card, 'id'>) {
    const id = Date.now().toString();
    const newCard = { ...card, id };
    await appendSheetData('cards', [newCard.id, newCard.name, newCard.brand, newCard.last4, newCard.expiry]);
    return newCard;
}


// Transactions
export async function getTransactions(): Promise<Transaction[]> {
    const data = await getSheetData('transactions');
    if (data.length < 2) return [];
    const headers = data[0] || [];
    return data.slice(1).map(row => ({
        id: row[headers.indexOf('id')],
        cardId: row[headers.indexOf('cardId')],
        description: row[headers.indexOf('description')],
        amount: parseFloat(row[headers.indexOf('amount')] || '0'),
        date: row[headers.indexOf('date')],
        category: row[headers.indexOf('category')] as Transaction['category'] || undefined,
        installments: (row[headers.indexOf('installments_current')] && row[headers.indexOf('installments_total')]) ? {
            current: parseInt(row[headers.indexOf('installments_current')], 10),
            total: parseInt(row[headers.indexOf('installments_total')], 10),
        } : undefined,
    }));
}

export async function addTransactionToSheet(transaction: Omit<Transaction, 'id'>) {
    const id = Date.now().toString();
    const newTransaction = { ...transaction, id };
    const values = [
        newTransaction.id,
        newTransaction.cardId,
        newTransaction.description,
        newTransaction.amount,
        newTransaction.date,
        newTransaction.category || '',
        newTransaction.installments?.current || '',
        newTransaction.installments?.total || '',
    ];
    await appendSheetData('transactions', values);
    return newTransaction;
}

export async function updateTransactionInSheet(transactionId: string, updates: Partial<Transaction>) {
    const data = await getSheetData('transactions');
    const headers = data[0] || [];
    const idIndex = headers.indexOf('id');
    const categoryIndex = headers.indexOf('category');

    if (idIndex === -1 || categoryIndex === -1) return;

    const rowIndex = data.findIndex(row => row[idIndex] === transactionId);

    if (rowIndex !== -1 && updates.category) {
        await updateSheetCell('transactions', rowIndex, categoryIndex, updates.category);
    }
}


// Debts
export async function getDebts(): Promise<Debt[]> {
    const data = await getSheetData('debts');
    if (data.length < 2) return [];
    const headers = data[0] || [];
    return data.slice(1).map(row => ({
        id: row[headers.indexOf('id')],
        person: row[headers.indexOf('person')],
        avatarUrl: row[headers.indexOf('avatarUrl')],
        amount: parseFloat(row[headers.indexOf('amount')] || '0'),
        reason: row[headers.indexOf('reason')],
        paid: (row[headers.indexOf('paid')] || 'false').toLowerCase() === 'true',
        date: row[headers.indexOf('date')],
        installments: (row[headers.indexOf('installments_current')] && row[headers.indexOf('installments_total')]) ? {
            current: parseInt(row[headers.indexOf('installments_current')], 10),
            total: parseInt(row[headers.indexOf('installments_total')], 10),
        } : undefined,
    }));
}

export async function addDebtToSheet(debt: Omit<Debt, 'id'>) {
    const id = Date.now().toString();
    const newDebt = { ...debt, id };
    const values = [
        newDebt.id,
        newDebt.person,
        newDebt.avatarUrl,
        newDebt.amount,
        newDebt.reason,
        newDebt.paid.toString(),
        newDebt.date,
        newDebt.installments?.current || '',
        newDebt.installments?.total || '',
    ];
    await appendSheetData('debts', values);
    return newDebt;
}

export async function updateDebtInSheet(debtId: string, updates: Partial<Debt>) {
    const data = await getSheetData('debts');
    const headers = data[0] || [];
    const idIndex = headers.indexOf('id');
    const paidIndex = headers.indexOf('paid');
    if (idIndex === -1 || paidIndex === -1) return;

    const rowIndex = data.findIndex(row => row[idIndex] === debtId);

    if (rowIndex !== -1 && updates.paid !== undefined) {
         await updateSheetCell('debts', rowIndex, paidIndex, updates.paid.toString());
    }
}
