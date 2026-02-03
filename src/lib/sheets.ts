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
    } catch (error: any) {
        // This block is a safeguard but the main error is caught in getSheetData
        if (error.message && (error.message.includes('DECODER') || error.message.includes('unsupported'))) {
            throw new Error(`Erro de formato na chave privada (GOOGLE_PRIVATE_KEY).\nIsso geralmente acontece na Vercel. Para corrigir:\n\n1. Copie sua chave privada (incluindo o início e o fim).\n2. Transforme-a em uma ÚNICA linha, substituindo cada quebra de linha pelo texto literal "\\n".\n3. Cole este valor na variável de ambiente GOOGLE_PRIVATE_KEY na Vercel.`);
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

        if (error.message && (error.message.includes('DECODER') || error.message.includes('unsupported'))) {
            throw new Error(`Erro de formato na chave privada (GOOGLE_PRIVATE_KEY).\nIsso geralmente acontece na Vercel. Para corrigir:\n\n1. Copie sua chave privada (incluindo o início e o fim).\n2. Transforme-a em uma ÚNICA linha, substituindo cada quebra de linha pelo texto literal "\\n".\n3. Cole este valor na variável de ambiente GOOGLE_PRIVATE_KEY na Vercel.`);
        }
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

async function deleteSheetRowById(sheetName: string, id: string) {
    const sheets = getSheets();
    if (!SHEET_ID) {
        throw new Error('A variável GOOGLE_SHEET_ID não foi encontrada no seu arquivo .env.');
    }

    const [data, spreadsheetMeta] = await Promise.all([
        getSheetData(sheetName),
        sheets.spreadsheets.get({ spreadsheetId: SHEET_ID }),
    ]);

    const headers = data[0];
    const idIndex = headers.indexOf('id');
    if (idIndex === -1) throw new Error(`Coluna 'id' não encontrada na aba '${sheetName}'.`);

    const rowIndexToDelete = data.findIndex(row => row[idIndex] === id);

    if (rowIndexToDelete === -1) {
        console.warn(`Row with id ${id} not found in ${sheetName}. Nothing to delete.`);
        return;
    }

    const sheetId = spreadsheetMeta.data.sheets?.find(s => s.properties?.title === sheetName)?.properties?.sheetId;

    if (sheetId === null || sheetId === undefined) {
        throw new Error(`Aba com o nome '${sheetName}' não foi encontrada na planilha.`);
    }

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId: sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndexToDelete,
                            endIndex: rowIndexToDelete + 1,
                        },
                    },
                },
            ],
        },
    });
}


// --- Specific Functions ---

// Cards
export async function getCards(): Promise<Card[]> {
    const data = await getSheetData('cards');
    if (data.length < 1) return []; // Allow empty sheet
    const headers = data[0] || [];
    const requiredHeaders = ['id', 'name', 'brand', 'last4', 'expiry', 'dueDate', 'closingDate'];
    if (!requiredHeaders.every(h => headers.includes(h))) {
        throw new Error(`A aba "cards" está com cabeçalhos ausentes ou incorretos. Garanta que a primeira linha contenha: ${requiredHeaders.join(', ')}`);
    }
    if (data.length < 2) return [];
    return data.slice(1).map(row => ({
        id: row[headers.indexOf('id')],
        name: row[headers.indexOf('name')],
        brand: row[headers.indexOf('brand')] as Card['brand'],
        last4: row[headers.indexOf('last4')],
        expiry: row[headers.indexOf('expiry')],
        dueDate: parseInt(row[headers.indexOf('dueDate')], 10),
        closingDate: parseInt(row[headers.indexOf('closingDate')], 10),
    }));
}

export async function addCardToSheet(card: Omit<Card, 'id'>) {
    const id = Date.now().toString();
    const newCard = { ...card, id };
    await appendSheetData('cards', [newCard.id, newCard.name, newCard.brand, newCard.last4, newCard.expiry, newCard.dueDate, newCard.closingDate]);
    return newCard;
}

export async function updateCardInSheet(cardId: string, updates: Partial<Omit<Card, 'id'>>) {
    const data = await getSheetData('cards');
    const headers = data[0] || [];
    const idIndex = headers.indexOf('id');
    if (idIndex === -1) {
        throw new Error("A coluna 'id' não foi encontrada na aba 'cards'.");
    }

    const rowIndex = data.findIndex(row => row[idIndex] === cardId);
    if (rowIndex === -1) {
        console.warn(`Cartão com id ${cardId} não encontrado. Não foi possível atualizar.`);
        return;
    }
    const rowNumberInSheet = rowIndex + 1;

    const headerMap = new Map(headers.map((h, i) => [h, i]));
    const updatePromises: Promise<void>[] = [];

    for (const key of Object.keys(updates)) {
        if (key === 'id') continue;
        const colIndex = headerMap.get(key);
        if (colIndex !== undefined) {
            const value = (updates as any)[key];
            updatePromises.push(updateSheetCell('cards', rowNumberInSheet, colIndex, value ?? ''));
        }
    }
    await Promise.all(updatePromises);
}

export async function deleteCardFromSheet(cardId: string) {
    await deleteSheetRowById('cards', cardId);
}


// Transactions
export async function getTransactions(): Promise<Transaction[]> {
    const data = await getSheetData('transactions');
    if (data.length < 1) return [];
    const headers = data[0] || [];
    const requiredHeaders = ['id', 'cardId', 'description', 'amount', 'date', 'category', 'installments_current', 'installments_total'];
    if (!requiredHeaders.every(h => headers.includes(h))) {
        throw new Error(`A aba "transactions" está com cabeçalhos ausentes ou incorretos. Garanta que a primeira linha contenha: ${requiredHeaders.join(', ')}`);
    }
    if (data.length < 2) return [];
    return data.slice(1).map(row => ({
        id: row[headers.indexOf('id')],
        cardId: row[headers.indexOf('cardId')],
        description: row[headers.indexOf('description')],
        amount: parseFloat((row[headers.indexOf('amount')] || '0').toString().replace(',', '.')),
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

export async function updateTransactionInSheet(transactionId: string, updates: Partial<Omit<Transaction, 'id'>>) {
    const data = await getSheetData('transactions');
    const headers = data[0] || [];
    const idIndex = headers.indexOf('id');
    if (idIndex === -1) {
        throw new Error("A coluna 'id' não foi encontrada na aba 'transactions'.");
    }

    const rowIndex = data.findIndex(row => row[idIndex] === transactionId);
    if (rowIndex === -1) {
        console.warn(`Transação com id ${transactionId} não encontrada. Não foi possível atualizar.`);
        return;
    }
    const rowNumberInSheet = rowIndex + 1;

    const headerMap = new Map(headers.map((h, i) => [h, i]));
    const updatePromises: Promise<void>[] = [];

    for (const key of Object.keys(updates)) {
        if (key === 'id') continue;

        let value = (updates as any)[key];

        if (key === 'installments') {
            const currentIdx = headerMap.get('installments_current');
            if (currentIdx !== undefined) {
                updatePromises.push(updateSheetCell('transactions', rowNumberInSheet, currentIdx, value?.current ?? ''));
            }
            const totalIdx = headerMap.get('installments_total');
            if (totalIdx !== undefined) {
                updatePromises.push(updateSheetCell('transactions', rowNumberInSheet, totalIdx, value?.total ?? ''));
            }
        } else {
            const colIndex = headerMap.get(key);
            if (colIndex !== undefined) {
                if (typeof value === 'boolean') {
                    value = value.toString();
                }
                updatePromises.push(updateSheetCell('transactions', rowNumberInSheet, colIndex, value ?? ''));
            }
        }
    }
    await Promise.all(updatePromises);
}

export async function deleteTransactionFromSheet(transactionId: string) {
    await deleteSheetRowById('transactions', transactionId);
}

// Debts
export async function getDebts(): Promise<Debt[]> {
    const data = await getSheetData('debts');
    if (data.length < 1) return [];
    const headers = data[0] || [];
    const requiredHeaders = ['id', 'person', 'avatarUrl', 'amount', 'reason', 'paid', 'date', 'installments_current', 'installments_total'];
    if (!requiredHeaders.every(h => headers.includes(h))) {
        throw new Error(`A aba "debts" está com cabeçalhos ausentes ou incorretos. Garanta que a primeira linha contenha: ${requiredHeaders.join(', ')}`);
    }
    if (data.length < 2) return [];
    return data.slice(1).map(row => ({
        id: row[headers.indexOf('id')],
        person: row[headers.indexOf('person')],
        avatarUrl: row[headers.indexOf('avatarUrl')],
        amount: parseFloat((row[headers.indexOf('amount')] || '0').toString().replace(',', '.')),
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

export async function updateDebtInSheet(debtId: string, updates: Partial<Omit<Debt, 'id'>>) {
    const data = await getSheetData('debts');
    const headers = data[0] || [];
    const idIndex = headers.indexOf('id');
    if (idIndex === -1) {
        throw new Error("A coluna 'id' não foi encontrada na aba 'debts'.");
    }

    const rowIndex = data.findIndex(row => row[idIndex] === debtId);
    if (rowIndex === -1) {
        console.warn(`Dívida com id ${debtId} não encontrada. Não foi possível atualizar.`);
        return;
    }
    const rowNumberInSheet = rowIndex + 1;

    const headerMap = new Map(headers.map((h, i) => [h, i]));
    const updatePromises: Promise<void>[] = [];

    // If person is being updated, also update avatarUrl
    if ('person' in updates && updates.person) {
        (updates as any).avatarUrl = `https://picsum.photos/seed/${updates.person.replace(/\s/g, '')}/40/40`;
    }

    for (const key of Object.keys(updates)) {
        if (key === 'id') continue;
        let value = (updates as any)[key];

        if (key === 'installments') {
            const currentIdx = headerMap.get('installments_current');
            if (currentIdx !== undefined) {
                updatePromises.push(updateSheetCell('debts', rowNumberInSheet, currentIdx, value?.current ?? ''));
            }
            const totalIdx = headerMap.get('installments_total');
            if (totalIdx !== undefined) {
                updatePromises.push(updateSheetCell('debts', rowNumberInSheet, totalIdx, value?.total ?? ''));
            }
        } else {
            const colIndex = headerMap.get(key);
            if (colIndex !== undefined) {
                if (typeof value === 'boolean') {
                    value = value.toString();
                }
                updatePromises.push(updateSheetCell('debts', rowNumberInSheet, colIndex, value));
            }
        }
    }
    await Promise.all(updatePromises);
}

export async function deleteDebtFromSheet(debtId: string) {
    await deleteSheetRowById('debts', debtId);
}
