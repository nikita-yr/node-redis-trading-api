const express = require('express');
const redis = require('redis');
const path = require('path');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the 'public' directory (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Redis client configuration
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
            // Deduct funds and update balance in Redis
            const newBalance = (parseFloat(currentBalance) - totalCost).toFixed(2);
            await client.set('bank_balance', newBalance);

            // Record transaction details in a Redis list for history tracking
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

// Fetches the current bank balance from Redis
app.get('/balance', async (req, res) => {
    const balance = await client.get('bank_balance');
    res.json({ bank_balance: balance });
});

// Retrieves the 10 most recent transactions
app.get('/history', async (req, res) => {
    const logs = await client.lRange('transactions', 0, 9);
    res.json({ history: logs.map(log => JSON.parse(log)) });
});

// Calculates the user's holdings based on transaction history
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

// Saves a backup of the current balance to Redis
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

// Simulates a server crash to test Docker's auto-restart capabilities
app.post('/chaos', (req, res) => process.exit(1));

// --- SERVER INITIALIZATION ---

async function start() {
    await client.connect();
    console.log('Connected to Redis');
    
    // Set initial balance to $1,000,000 if the key is empty
    if (!(await client.get('bank_balance'))) {
        await client.set('bank_balance', 1000000);
    }
    
    app.listen(3000, () => {
        console.log('Exchange engine running on http://localhost:3000');
    });
}

start();