# Credit Clarity: Seu Painel de Controle Financeiro

Bem-vindo ao Credit Clarity! Este é um projeto Next.js que transforma uma simples planilha do Google em um painel financeiro inteligente e interativo. A aplicação foi projetada para fornecer clareza sobre seus gastos com cartão de crédito, faturas futuras e dívidas a receber.

## Visão Geral do Projeto

O objetivo principal é oferecer uma interface de usuário limpa e eficiente para visualizar e gerenciar finanças pessoais que são armazenadas em uma planilha do Google. A aplicação se conecta à sua planilha, lê os dados de transações, cartões e dívidas, e os apresenta em um dashboard rico e interativo. Além disso, utiliza Inteligência Artificial (IA) para categorizar despesas e gerar resumos de gastos.

## Arquitetura e Tecnologias

Este projeto é construído sobre uma arquitetura moderna e robusta, utilizando as seguintes tecnologias:

-   **Frontend**:
    -   **Next.js**: Framework React para renderização no lado do servidor (SSR) e geração de sites estáticos (SSG).
    -   **React**: Biblioteca para construção de interfaces de usuário.
    -   **TypeScript**: Superset de JavaScript que adiciona tipagem estática.
    -   **Tailwind CSS**: Framework CSS utility-first para estilização rápida e customizável.
    -   **ShadCN/UI**: Coleção de componentes de UI reutilizáveis e acessíveis, construídos sobre Radix UI e Tailwind CSS.

-   **Fonte de Dados (Backend Simulado)**:
    -   **Google Sheets**: Atua como o banco de dados principal. Toda a informação sobre cartões, transações e dívidas é lida e escrita em uma planilha Google.
    -   **Next.js API Routes**: Um conjunto de endpoints (`/api/data/[sheet]`) que serve como uma camada intermediária para se comunicar com a API do Google Sheets. Isso permite que o frontend interaja com a planilha de forma segura, sem expor as credenciais no lado do cliente.
    -   **Google APIs (`googleapis`)**: Biblioteca Node.js para autenticar e interagir com os serviços do Google.

-   **Inteligência Artificial**:
    -   **Genkit (Google AI)**: Utilizado para duas funcionalidades principais:
        1.  `categorizePurchases`: Um fluxo que analisa a descrição de transações não categorizadas e atribui a elas uma categoria (ex: Alimentação, Transporte).
        2.  `summarizeSpendingInsights`: Um fluxo que gera um resumo em linguagem natural sobre seus padrões de gastos do mês.

## Configuração do Projeto

Para rodar este projeto localmente, você precisará configurar o ambiente e a planilha do Google corretamente.

### 1. Pré-requisitos

-   Node.js (versão 18 ou superior)
-   npm ou yarn
-   Uma Conta Google

### 2. Configuração do Ambiente

a. **Clone o repositório e instale as dependências:**

```bash
git clone <url-do-repositorio>
cd <nome-do-projeto>
npm install
```

b. **Crie um arquivo de ambiente:**
Renomeie o arquivo `.env.example` para `.env` (ou crie um novo) e adicione as seguintes variáveis:

```
GOOGLE_SHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

### 3. Configuração do Google Cloud e Google Sheets

Esta é a parte mais crítica da configuração.

a. **Crie um Projeto no Google Cloud Platform (GCP)**:
   - Acesse o [console do Google Cloud](https://console.cloud.google.com/) e crie um novo projeto.
   - No seu projeto, ative a **API do Google Sheets**.

b. **Crie uma Conta de Serviço (Service Account)**:
   - No menu de navegação do GCP, vá para "IAM e Admin" > "Contas de Serviço".
   - Crie uma nova conta de serviço. Dê um nome a ela (ex: "planilha-app-sa").
   - Após criar, clique na conta de serviço, vá para a aba "CHAVES", clique em "ADICIONAR CHAVE" > "Criar nova chave".
   - Escolha o formato **JSON** e o arquivo será baixado.
   - Abra o arquivo JSON. Você precisará de três informações para o seu arquivo `.env`:
     - `client_email`: Cole este valor em `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
     - `private_key`: Cole a chave completa (incluindo `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`) em `GOOGLE_PRIVATE_KEY`. **Importante**: Para ambientes como a Vercel, você precisará formatar a chave em uma única linha, substituindo as quebras de linha por `\n`.
   - Guarde este e-mail da conta de serviço.

c. **Crie e Configure a Planilha do Google**:
   - Crie uma nova planilha no [Google Sheets](https://sheets.google.com/).
   - Copie o ID da planilha da URL. A URL se parece com `https://docs.google.com/spreadsheets/d/SEU_SHEET_ID_AQUI/edit`. Cole este ID na variável `GOOGLE_SHEET_ID` do seu `.env`.
   - Clique em "Compartilhar" (Share) no canto superior direito da planilha.
   - Cole o e-mail da conta de serviço (que você copiou do GCP) e conceda a permissão de **Editor**. Isso é essencial para que a aplicação possa ler e escrever na planilha.

d. **Configure as Abas da Planilha**:
   Crie três abas (sheets) na sua planilha com os seguintes nomes e cabeçalhos exatos na primeira linha:

   -   **Aba `cards`**:
       `id`, `name`, `brand`, `last4`, `expiry`, `dueDate`, `closingDate`

   -   **Aba `transactions`**:
       `id`, `cardId`, `description`, `amount`, `date`, `category`, `installments_current`, `installments_total`

   -   **Aba `debts`**:
       `id`, `person`, `avatarUrl`, `amount`, `reason`, `paid`, `date`, `installments_current`, `installments_total`

### 4. Rodando a Aplicação

Com tudo configurado, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse `http://localhost:9002` no seu navegador para ver a aplicação em funcionamento.

## Estrutura de Arquivos

```
/src
├── ai/                    # Configuração e fluxos do Genkit (IA)
├── app/                   # Rotas do Next.js App Router
│   ├── api/               # API Routes, incluindo a que se conecta ao Google Sheets
│   ├── (pages)/           # Grupos de rotas para as páginas principais
│   └── layout.tsx         # Layout principal da aplicação
├── components/            # Componentes React
│   ├── dashboard/         # Componentes específicos do painel
│   ├── layout/            # Componentes de layout (Sidebar, Header)
│   └── ui/                # Componentes de UI genéricos (ShadCN)
├── context/               # Contexto React para gerenciamento de estado global (dados)
├── hooks/                 # Hooks React customizados
└── lib/                   # Funções utilitárias, tipos e lógica de negócio
    ├── sheets.ts          # Lógica de comunicação com a API do Google Sheets
    └── types.ts           # Definições de tipos TypeScript (Card, Transaction, Debt)
```

## Como Funciona

1.  **Carregamento de Dados**: Quando a aplicação inicia, o `DataProvider` (em `src/context/data-context.tsx`) faz uma chamada para a API interna (`/api/data/...`).
2.  **API Route**: A API route (`src/app/api/data/[sheet]/route.ts`) recebe a requisição, usa a biblioteca `googleapis` e as credenciais do `.env` para se autenticar e buscar os dados das abas correspondentes na sua planilha.
3.  **Exibição no Frontend**: Os dados retornados pela API são armazenados no `DataContext` e distribuídos para todos os componentes que os consomem, como o dashboard, listas de cartões, transações, etc.
4.  **Ações do Usuário**: Quando você adiciona, edita ou deleta um item (ex: uma nova transação), o `DataContext` executa uma função que:
    -   Atualiza o estado localmente para uma resposta de UI imediata (atualização otimista).
    -   Envia uma requisição (POST, PUT, DELETE) para a API interna.
    -   A API, por sua vez, executa a operação correspondente na planilha do Google Sheets.
5.  **Cálculos do Dashboard**: O componente `src/components/dashboard/overview.tsx` contém a lógica principal para calcular os valores dos cards do painel ("Fatura Aberta", "Saldo Parcelado Futuro", etc.), garantindo que todas as datas e parcelas sejam tratadas corretamente em UTC para evitar erros de fuso horário.
