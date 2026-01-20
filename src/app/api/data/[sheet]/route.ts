import { NextResponse } from 'next/server';
import { 
    getCards, getTransactions, getDebts,
    addCardToSheet, addTransactionToSheet, addDebtToSheet,
    updateDebtInSheet, updateTransactionInSheet
} from '@/lib/sheets';
import type { Card, Transaction, Debt } from '@/lib/types';

export async function GET(
    request: Request,
    { params }: { params: { sheet: string } }
) {
    const sheet = params.sheet;
    try {
        let data;
        if (sheet === 'cards') data = await getCards();
        else if (sheet === 'transactions') data = await getTransactions();
        else if (sheet === 'debts') data = await getDebts();
        else return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
        
        return NextResponse.json(data);
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch data from sheet' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { sheet: string } }
) {
    const sheet = params.sheet;
    const body = await request.json();
    try {
        let newData;
        if (sheet === 'cards') newData = await addCardToSheet(body as Omit<Card, 'id'>);
        else if (sheet === 'transactions') newData = await addTransactionToSheet(body as Omit<Transaction, 'id'>);
        else if (sheet === 'debts') newData = await addDebtToSheet(body as Omit<Debt, 'id'>);
        else return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });

        return NextResponse.json(newData, { status: 201 });
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to add data to sheet' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { sheet: string } }
) {
    const sheet = params.sheet;
    const { id, updates } = await request.json();
    try {
        if (sheet === 'transactions') await updateTransactionInSheet(id, updates);
        else if (sheet === 'debts') await updateDebtInSheet(id, updates);
        else return NextResponse.json({ error: 'Sheet not found or not updatable' }, { status: 404 });
        
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to update data in sheet' }, { status: 500 });
    }
}
