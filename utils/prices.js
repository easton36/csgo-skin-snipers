const {Items} = require('../db/Schemas.js');
const axios = require('axios');

const { general } = require('../config.js');

//for fetching entire price list
const reloadPriceList = async ()=>{
    let data = await axios.get(`https://api.pricempire.com/v1/getAllItems?token=${general.pricempire_api}`);
    //insert prices fetched
    await insertPrices(data.data.items);
}
//for reloading new db prices
const insertPrices = async (items)=>{
    //remove old prices from db
    await Items.deleteMany({});
    //update new prices
    await Items.insertMany(items);

    return true;
}
//for when we wanna fetch an item price
const getPrices = async (item_name)=>{
    //fetch item name from db
    let data = await Items.findOne({name: item_name});
    //if we cant find item
    if(!data) return false;

    return data.prices;
}
//for when we wanna fetch specific empire and buff prices
const getEmpireBuffPrices = async (item_name)=>{
    //fetch item name from db
    let data = await Items.findOne({name: item_name});
    //if we cant find item
    if(!data) return false;

    return {
        empire: (Number(data.prices.csgoempire.price) * general.empire_ratio) / 100,
        buff: Number(data.prices.buff163.price) * general.cny_ratio
    }
}
//when we want to get estimated sale value of item
const getSaleValue = async (item_name)=>{
    //fetch item name from db
    let data = await Items.findOne({name: item_name});
    //if we cant find item
    if(!data || !data.prices?.buff163 || !data.prices?.buff163_quick) return {price: 0};
    //return price
    if((data.prices.buff163.price * 0.88) > data.prices.buff163_quick.price){
        return {price: data.prices.buff163_quick.price * general.cny_ratio};
    }
    return {price: data.prices.buff163.price * general.cny_ratio};
}

module.exports = {
    reloadPriceList,
    getPrices,
    getEmpireBuffPrices,
    getSaleValue
}