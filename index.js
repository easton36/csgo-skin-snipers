const mongoose = require('mongoose');
const { general } = require('./config.js');

const { reloadPriceList } = require('./utils/prices.js');

const csgoempire = require('./scripts/csgoempire.js');
const duelbits = require('./scripts/duelbits.js');
const skinwallet = require('./scripts/skinwallet.js');

mongoose.connect(`mongodb://127.0.0.1:27017/${general.db_name}`, { useNewUrlParser: true, useUnifiedTopology: true });

const args = process.argv.slice(2);

setInterval(()=>{
    reloadPriceList();
}, general.price_update_rate * 1000);

(async () => {
    //initial price load
    if(args.includes('--update-prices')){
        await reloadPriceList();
    }

    if(args.includes('--script')){
        switch(args[args.findIndex(arg => arg === '--script') + 1]){
            case 'csgoempire':
                new csgoempire();
                break;
            case 'duelbits':
                new duelbits();
                break;
            case 'skinwallet':
                new skinwallet();
                break;
            default:
                console.error('[ERROR] Unknown script');
                process.exit(1);
        }
    } else{
        console.error('[ERROR] No script specified');
        process.exit(1);
    }
})();