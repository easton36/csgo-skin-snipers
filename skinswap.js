const io = require('socket.io-client');
const fs = require('fs');

const socket = io('https://skinswap.com');

socket.on('connect', ()=>{
    console.log('[INFO] Connected to skinswap.com');
});

var transactions = [];

socket.on('new-transaction', (data)=>{
    console.log(`[INFO] New transaction: ${data.id}`, data);
    transactions.push(data);
});

process.on('beforeExit', ()=>{
    fs.writeFileSync('transactions.json', JSON.stringify(transactions));
});