// server.js
const express = require('express');
const fetch = require('node-fetch'); // <-- ADICIONE ESTA LINHA
const cors = require('cors');

const app = express();
const port = 3000; // Porta onde nosso servidor vai rodar

// --- CONFIGURAÇÃO IMPORTANTE ---
// Coloque seu Token da PushInPay aqui. NUNCA exponha isso no frontend.
const PUSHINPAY_API_TOKEN = '47073|QKcWJLCMKYQRkaJIIIENSgVl9HZAolu4zVtT0xF9de9a6059'; 
const PUSHINPAY_API_URL = 'https://api.pushinpay.com.br/api/pix/cashIn';

app.use(cors());
app.use(express.json());

// Rota para criar o PIX
app.post('/create-pix', async (req, res) => {
    const { valueInCents, orderBumps } = req.body;
    let totalValue = valueInCents;

    // Soma os valores dos order bumps, se houver
    if (orderBumps && Array.isArray(orderBumps)) {
        orderBumps.forEach(bump => {
            totalValue += bump.price;
        });
    }

    if (!totalValue || totalValue < 50) {
        return res.status(400).json({ error: 'Valor inválido. O valor total deve ser no mínimo 50 centavos.' });
    }

    try {
        const headers = {
            'Authorization': `Bearer ${PUSHINPAY_API_TOKEN}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        const body = JSON.stringify({
            "value": totalValue
        });

        const response = await fetch(PUSHINPAY_API_URL, {
            method: 'POST',
            headers: headers,
            body: body
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao gerar PIX na PushInPay.');
        }

        res.json(data);

    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor do checkout rodando na porta ${port}. Não feche esta janela!`);
});
