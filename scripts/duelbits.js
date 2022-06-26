const ioClient = require("socket.io-client");
const { duelbits: config } = require('../config.js');

const {getSaleValue} = require('../utils/prices.js');

module.exports = class{
  constructor(){
    this.startClass();
  }
  //for when we want to turn on this feature
  async startClass(){
    try{
      console.log('[DUELBITS] Starting...');
      this.socket = ioClient(`https://ws.duelbits.com/?key=${config.cloudflareBypass}`, {
        extraHeaders: {
          'Origin': "https://duelbits.com",
          'Referer': 'https://duelbits.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
        },
        transports: ["websocket"],
        withCredentials: !0
      });
    } catch(err){
      console.log('[DUELBITS] Websocket initialization error: ', err.message);
    }

    //listen for connection
    this.socket.on('connect', ()=>{
      //tell duelbits to authenticate us
      this.socket.emit('auth:authenticate', {
        access: config.auth_key
      }, (err, data)=>{
        if(err == 'Invalid access token'){
          console.error('[DUELBITS] Invalid access token. Please check your auth_key.');
          process.exit(1);
        }

        console.log('[DUELBITS] Successfully authenticated to websocket.');

        this.balance = data.balance;
      });
    });

    //listen for duelbits disconnecting us
    this.socket.on('disconnect', ()=>{
      console.log('[DUELBITS] Disconnected from websocket.');
    });

    //tell duelbits that we are still online
    this.socket.on('pay:p2p:ping', (data) => {      
      this.socket.emit('pay:p2p:pong', { id: data.id });
    });

    //for when our balance updates
    this.socket.on('user:update', (data) => {
      this.balance = data.balance;
    });

    //for when a new item is listen on the market
    this.socket.on('pay:p2p:newListing', (data) => { 
      if(data.items.length === 1){ //listings with more than one item are rarely profitable
        this.checkIfWorth(data.id, data.items[0].price, data.items[0].name);
      }
    });

    //when an event is completed
    this.socket.on('pay:p2p:complete', async (data)=>{
      //when we purchased an item
      if(data.buyer.id === config.steam_id){
        console.log('[DUELBITS] Item purchased.');
      }
    });
  }
  //check if a single item is worth withdrawing
  async checkIfWorth(id, price, name){
    //if it doesnt meet our initial params
    if(price < config.min_price * 100 || price > config.max_price * 100) return;
    //fetch item price from db
    let dbPrice = await getSaleValue(name);
    if(dbPrice.price > price * config.expected_roi){
      this.buySkin(id, name);
    }
    console.log(`[DUELBITS] Checked if ${name} was worth withdrawing. Database price is ${(dbPrice.price)/100}. Duelbits price is ${price/100}`); 
  }
  //for getting all of our item listings
  async getListings(){
    return new Promise((res, rej)=>{
      this.socket.emit('pay:p2p:getMyListings', (err, listings) => {
        if(err) rej(err);
        res(listings);
      });
    });
  }
  //for when we wanna snipe a skin off duelbits
  async buySkin(id, name) {
    this.socket.emit('pay:p2p:join', {
      tradeUrl: config.trade_url,
      id: id,
    }, (data) => {
      if(!data) return;
      if(data == 'Insufficient balance') return;

      console.log(`[DUELBITS] Error whilst buying ${name}: ${data}`);
    });
  }
}