const axios = require('axios');

const {getSaleValue} = require('../utils/prices.js');

const { skinwallet: config } = require('../config.js');

module.exports = class{
    constructor(){
        this.startClass();
        this.delay = 0;
    }
    async startClass(){
        await this.getBalance();
        this.checkAllItems();
    }
    //get our current balance
    async getBalance(){
        try{
            //get balance from skinwallet
            let data = await axios({
                method: 'GET',
                url: 'https://www.skinwallet.com/market/api/account/get-balance',
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Auth-Token": config.api_key
                }
            })

            this.balance = data.data.result.accountBalance.amount;
        } catch(err){
            console.error('[SKINWALLET]', err.response.data);
            process.exit(1);
        }
    }
    //iterating function to check all the items
    async checkAllItems(){
        for(item of config.item_names){
            this.delay++;
            this.getItemListings(item.name, this.delay);
            if(config.item_names.indexOf(item) === config.item_names.length - 1){
                setTimeout(()=>{
                    this.checkAllItems();
                }, 500 * this.delay);
            }
        }
    }
    //getting skinwallet listing for the item
    async getItemListings(name, delay){
        setTimeout(async ()=>{
            let data = await axios({
                method: 'POST',
                url: 'https://www.skinwallet.com/market/api/offers/search',
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Auth-Token": config.api_key
                },
                data: {
                    "appId": 730,
                    "minPrice": {
                        "amount": config.min_price,
                        "currency": "USD"
                    },
                    "maxPrice": {
                        "amount": config.max_price,  //add max price here
                        "currency": "USD"
                    },
                    "max": 15,
                    "marketHashName": name,
                    "sortBy": "priceDESC"
                }
            });
            if(!data) return;
            //iterate through results and check
            for(const result of data.data.result){
                this.checkItemWorth(result, delay, result, tradableAt);
            }
        }, 500 * delay)
    }
    async checkItemWorth(item, delay, tradableAt){
        if(!tradableAt || tradableAt == null || typeof tradableAt == undefined) return;

        let dbPrice = await getSaleValue(item.marketHashName, this.params.mainId, this.id);
        let daysUntil = (tradableAt.unixTimestamp - (Date.now()/1000).toFixed(0))/(60 * 60 * 24);
        let expectedROI = config.expected_roi + (.01 * daysUntil);

        console.log("[SKINWALLET] Checked if worth buying " + item + " at a price of " + item.price.amount +".  Database price: " + dbPrice.price/100 + " and required ROI " + Number(this.params.expectedROI));
        //buy item if meets parals
        if(item.price.amount * expectedROI < dbPrice.price/100){
            this.buyItem(item.offerId, item.price.amount, item.marketHashName, item);
        }
    }
    async buyItem(tradeID, price, name, item){
        new SendWebhook(this.params.mainId, this.id, 'skinwallet', "[SKINWALLET] Attemtping to buy item " + name + "($" + price + ")");
        //tell skinwallet to buy skin
        let data = await axios({
            method: 'POST',
            url: 'https://www.skinwallet.com/market/api/buy-items',
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": config.api_key
            },
            data: {
                "offerId": tradeID,
                "buyWithPrice": {
                  "amount": price,
                  "currency": "USD"
                }
            }
        }).catch(console.log)
        //tell client we bought item
        if(!data) return console.log('[SKINWALLET] failed to buy item');

        this.balance = this.balance - price;
    }
}