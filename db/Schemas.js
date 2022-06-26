const mongoose = require('mongoose');

//our item prices list
exports.Items = mongoose.model('masterPriceList', new mongoose.Schema({
    name: String,
    appId: Number,
    prices: {
        csgoempire: {
            sourcePrice: Number,
            sourceCurrency: String,
            price: Number,
            createdAt: String
        },
        bitskins: {
            sourcePrice: Number,
            sourceCurrency: String,
            price: Number,
            createdAt: String
        },
        bitskins_recent: {
            sourcePrice: Number,
            sourceCurrency: String,
            price: Number,
            createdAt: String
        },
        buff163: {
            sourcePrice: Number,
            sourceCurrency: String,
            price: Number,
            createdAt: String
        },
        buff163_quick: {
            sourcePrice: Number,
            sourceCurrency: String,
            price: Number,
            createdAt: String
        },
        waxpeer_avg7: {
            sourcePrice: Number,
            sourceCurrency: String,
            price: Number,
            createdAt: String
        },
        waxpeer_avg30: {
            sourcePrice: Number,
            sourceCurrency: String,
            price: Number,
            createdAt: String
        },
        shadowpay: {
            sourcePrice: Number,
            sourceCurrency: String,
            price: Number,
            createdAt: String
        },
        waxpeer: {
            sourcePrice: Number,
            sourceCurrency: String,
            price: Number,
            createdAt: String
        },
        shadowpay_avg7: {
            sourcePrice: Number,
            sourceCurrency: String,
            price: Number,
            createdAt: String
        },
    }
}));