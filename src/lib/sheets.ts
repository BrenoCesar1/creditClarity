import { google } from 'googleapis';
import type { Card, Transaction, Debt } from './types';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

const getAuth = () => {
    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!serviceEmail || !privateKey) {
        throw new Error('As credenciais da conta de serviço Google (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY) não foram encontradas nas variáveis de ambiente. Verifique sua configuração na Vercel.');
    }
    
    try {
        const credentials = {
            client_email: serviceEmail,
            private_key: privateKey.replace(/\\n/g, '\n'),
        };
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        return auth;
    } catch(error: any) {
        if (error.message && error.message.includes('DECODER')) {
            throw new Error(`Erro de formato na chave privada (GOOGLE_PRIVATE_KEY).\nIsso geralmente acontece na Vercel. Para corrigir:\n\n1. Copie sua chave privada (incluindo o início e o fim).\n2. Transforme-a em uma ÚNICA linha, substituindo cada quebra de linha pelo texto literal "\\\\n".\n3. Cole este valor na variável de ambiente GOOGLE_PRIVATE_KEY na Vercel.`);
        }
        throw error;
    }
};

const getSheets = () => {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
};

// --- Generic Functions ---

async function getSheetData(sheetName: string): Promise<any[][]> {
    if (!SHEET_ID) {
        throw new Error('A variável GOOGLE_SHEET_ID não foi encontrada no seu arquivo .env.');
    }
    const sheets = getSheets();
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: sheetName,
        });
        return response.data.values || [];
    } catch (error: any) {
        console.error(`Error fetching data from ${sheetName}:`, error);
        if (error.code === 403) { // Permission denied
             throw new Error(`Permissão negada para acessar a planilha. Verifique dois pontos: 1) Você compartilhou a planilha com o e-mail da conta de serviço ('${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}') e deu permissão de "Editor". 2) A API do Google Sheets está ativada no seu projeto Google Cloud.`);
        }
        if (error.code === 400 && error.message.includes('Unable to parse range')) {
            throw new Error(`A aba "${sheetName}" não foi encontrada ou está mal formatada na sua planilha. Verifique o nome da aba e se ela tem algum conteúdo.`);
        }
        if (error.code === 404) { // Not found
             throw new Error(`Planilha não encontrada. Verifique se o GOOGLE_SHEET_ID no seu arquivo .env está correto.`);
        }
        throw new Error(`Ocorreu um erro ao buscar dados da planilha: ${error.message}`);
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
    const range = `${sheetName}!${colLetter}${rowIndex}`;
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
    if (data.length < 1) return []; // Allow empty sheet
    const headers = data[0] || [];
    const requiredHeaders = ['id', 'name', 'brand', 'last4', 'expiry'];
    if(!requiredHeaders.every(h => headers.includes(h))) {
        throw new Error(`A aba "cards" está com cabeçalhos ausentes ou incorretos. Garanta que a primeira linha contenha: ${requiredHeaders.join(', ')}`);
    }
    if (data.length < 2) return [];
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
    if (data.length < 1) return [];
    const headers = data[0] || [];
    const requiredHeaders = ['id', 'cardId', 'description', 'amount', 'date', 'category', 'installments_current', 'installments_total'];
     if(!requiredHeaders.every(h => headers.includes(h))) {
        throw new Error(`A aba "transactions" está com cabeçalhos ausentes ou incorretos. Garanta que a primeira linha contenha: ${requiredHeaders.join(', ')}`);
    }
    if (data.length < 2) return [];
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
        await updateSheetCell('transactions', rowIndex + 1, categoryIndex, updates.category);
    }
}


// Debts
export async function getDebts(): Promise<Debt[]> {
    const data = await getSheetData('debts');
    if (data.length < 1) return [];
    const headers = data[0] || [];
    const requiredHeaders = ['id', 'person', 'avatarUrl', 'amount', 'reason', 'paid', 'date', 'installments_current', 'installments_total'];
    if(!requiredHeaders.every(h => headers.includes(h))) {
        throw new Error(`A aba "debts" está com cabeçalhos ausentes ou incorretos. Garanta que a primeira linha contenha: ${requiredHeaders.join(', ')}`);
    }
    if (data.length < 2) return [];
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
         await updateSheetCell('debts', rowIndex + 1, paidIndex, updates.paid.toString());
    }
}
