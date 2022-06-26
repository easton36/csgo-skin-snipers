const axios = require('axios');
const ioClient = require("socket.io-client-2x");

const {getEmpireAndBuffPrice} = require('../utils/prices.js');

const { csgoempire: config } = require('../config.js');

const mainHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
    'Referer': 'https://csgoempire.com/withdraw',
    'Accept': '/',
    'Connection': 'keep-alive',
};

module.exports = class{
    constructor(){
        this.startClass();
    }
    startClass(){
        try{
            this.socket = ioClient(`wss://roulette.csgoempire.com/notifications`, {
                path: "/s",
                transports: ['websocket'],
                secure: true,
                rejectUnauthorized: false,
                reconnect: true,
                extraHeaders: {
                'User-agent': mainHeaders['User-Agent'],
                'Referer': 'https://csgoempire.com/withdraw',
                },
            });
        } catch(err){
            console.log(`CSGOEMPIRE Socket:` + err.description?.message);
        }

        this.socket.on('error', err => {
            console.log(`error: ${err}`);
        });

        this.socket.on('disconnect', ()=>{
            console.log('[EMPIRE] Socket disconnected.');
        });

        this.socket.on('connect_error', console.log);

        //when we connect to socket
        this.socket.on('connect', async ()=>{
            //fetch meta data
            let data = await this.requestData();
            if(data.err || !data.data.user){
                console.error('[EMPIRE] Your authentication cookie is invalid.');
                process.exit(1);
            }
            data = data.data;
            //tell csgo empire who we are
            this.socket.emit('identify', {
                uid: data.user.id,
                model: data.user,
                authorizationToken: data.socket_token,
                signature: data.socket_signature
            });

            this.balance = data.user.balance;
            //subscribe to get items socket
            this.socket.emit('p2p/new-items/subscribe', 1);

            console.log(`[EMPIRE] Socket connected.`);
        });
    }
    //request meta data from empire
    async requestData(){
        let data = await axios.get('https://csgoempire.com/api/v2/metadata', {
            headers: {
                cookie: config.cookies,
                ...mainHeaders,
            }
        });

        if(data) return {data: data.data};
    }
    //confirm that we are still online
    async afkConfirm(itemId){
        let data = await axios({
            method: 'POST',
            url: 'https://csgoempire.com/api/v2/p2p/afk-confirm',
            headers: {
                cookie: config.cookies,
                ...mainHeaders,
            },
            data: {
                id: itemId
            }
        }).catch(console.log);

        return data.data;
    }
    async updateToken(){
        //set auth pin
        let data = await axios({
            method: 'POST',
            url: 'https://csgoempire.com/api/v2/user/security/token',
            headers: {
                cookie: config.cookies,
                ...mainHeaders,
            },
            data: {
                code: config.pin,
                uuid: config.uuid
            }
        }).catch(console.log);
        //fetch user info
        let userInfo = await axios({
            method: 'GET',
            url: 'https://csgoempire.com/api/v2/user',
            headers
        }).catch(console.log);
        
        return {tokenData: data.data, userInfo: userInfo.data};
    }
    //check if a skin is worth purchasing
    async checkIfWorth(id, price, name, botId){
        //dont check if doesnt fit price range
        if(price < (config.min_price * 100) || price > (config.max_price * 100)) return;
        //fetch item worth
        let dbPrice = await getEmpireAndBuffPrice(name);
        console.log("[EMPIRE] Checked if " + name + " was worth withdrawing.  " + "Estimated empire sale value is " + (dbPrice.empire * 1.11)/100 + " and Estimated buff sale value is " + dbPrice.buff/100 + ".  CSGOEmpire price is " + price/100 + ".");
        
        if((dbPrice.empire * 1.11) / price > config.expected_roi && dbPrice.buff/price > config.expected_roi){
            await this.buySkin(id, price, name, botId);
        }
    }
    //buy a skin from csgo empire
    async buySkin(id, price, name, botId) {
        console.log(`[EMPIRE] Attempting to buy item ${name}(${price / 100}$)`);
        let headers = {
         headers: {
           cookie: this.params.cookies,
           ...mainHeaders,
          }
        }
        //request to withdraw skin
        let data = await axios({
            method: 'POST',
            url: 'https://csgoempire.com/api/v2/trade/withdraw',
            headers,
            data: {
                item_ids: [id],
                bot_id: botId,
                security_token: token
            }
        }).catch(console.log);

        if(data?.data){
            console.log("[EMPIRE] Finished buy attempt");
            if(data?.data?.success == true){
                console.log(`[EMPIRE] Bought item ${name}(${price / 100}$)`)
            } else{
                console.log(data.data);
            }
        }        
    }
}