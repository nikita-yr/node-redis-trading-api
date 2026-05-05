const express = require('express');
const redis = require('redis');
const app = express();

app.use(express.json());

const client = redis.createClient({ 
    url: process.env.REDIS_URL || 'redis://redis:6379' 
});

client.on('error', (err) => console.log('Redis Error', err));

// --- 1. MARKET DATA (PRICES & TICKERS) ---

// Returns a simulated random price for a given stock symbol
app.get('/ticker/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const price = (Math.random() * 1000).toFixed(2);
    res.json({ symbol, price: parseFloat(price), currency: 'USD' });
});

// --- 2. TRADING LOGIC ---

// Handles stock purchase: checks balance, updates Redis, and logs transaction
app.post('/buy', async (req, res) => {
    try {
        const { symbol, amount, price } = req.body;
        const totalCost = amount * price;
        const currentBalance = await client.get('bank_balance');
        
        if (parseFloat(currentBalance) >= totalCost) {
            // Rounds to 2 decimal places to avoid floating point math artifacts
            const newBalance = (parseFloat(currentBalance) - totalCost).toFixed(2);
            await client.set('bank_balance', newBalance);

            // Push transaction details to a Redis list for history
            await client.lPush('transactions', JSON.stringify({
                type: 'BUY',
                symbol: symbol.toUpperCase(),
                amount,
                price,
                totalCost: parseFloat(totalCost.toFixed(2)),
                date: new Date()
            }));
            
            res.json({ status: 'success', new_balance: newBalance });
        } else {
            res.status(400).json({ status: 'error', message: 'Insufficient funds' });
        }
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Trade failed' });
    }
});

// --- 3. ANALYTICS (PORTFOLIO & HISTORY) ---

// Returns the current cash balance
app.get('/balance', async (req, res) => {
    const balance = await client.get('bank_balance');
    res.json({ bank_balance: balance });
});

// Returns the last 10 transactions from the history list
app.get('/history', async (req, res) => {
    const logs = await client.lRange('transactions', 0, 9);
    res.json({ history: logs.map(log => JSON.parse(log)) });
});

// Calculates current holdings by iterating through the transaction history
app.get('/portfolio', async (req, res) => {
    const history = await client.lRange('transactions', 0, -1);
    const portfolio = {};
    history.forEach(log => {
        const tx = JSON.parse(log);
        if (!portfolio[tx.symbol]) portfolio[tx.symbol] = 0;
        portfolio[tx.symbol] += (tx.type === 'BUY' ? tx.amount : -tx.amount);
    });
    res.json({ portfolio });
});

// --- 4. SYSTEM UTILITIES (STATE MANAGEMENT) ---

// Creates a snapshot of the current balance for future rollback
app.post('/save', async (req, res) => {
    const currentBalance = await client.get('bank_balance');
    await client.set('bank_snapshot', currentBalance);
    res.json({ status: 'saved', snapshot: currentBalance });
});

// Restores the balance from the last saved snapshot
app.post('/rollback', async (req, res) => {
    const snapshot = await client.get('bank_snapshot');
    if (snapshot) {
        await client.set('bank_balance', snapshot);
        res.json({ status: 'rolled back', new_balance: snapshot });
    } else {
        res.status(404).json({ error: 'No snapshot found' });
    }
});

// Forces the process to exit to test Docker's restart policy
app.post('/chaos', (req, res) => process.exit(1));

// --- SERVER INITIALIZATION ---

async function start() {
    await client.connect();
    console.log('Connected to Redis');
    
    // Initialize bank balance if it doesn't exist
    if (!(await client.get('bank_balance'))) {
        await client.set('bank_balance', 1000000);
    }
    
    app.listen(3000, () => console.log('Exchange engine running on port 3000'));
}

start();