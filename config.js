exports.general = {
    empire_ratio: 0.614, // ratio of csgoempire coins to USD
    cny_ratio: 0.15, // ratio of CNY to USD

    pricempire_api: '', // pricempire api key

    db_name: 'prices_db', // mongoDB database name
    price_update_rate: 86400 // interval in seconds in which the price database is updated. 86400 = 1 day
};
//settings for duelbits.com
exports.duelbits = {
    steam_id: '', // steam id 64 of the account to use for duelbits
    trade_url: '', //steam trade url associated with the duelbits account

    auth_key: '', // duelbits authentication cooie

    min_price: 0, // minimum price to buy an item
    max_price: 0, // maximum price to buy an item

    expected_roi: 0, // minimum ROI to consider an item as purchasable

    cloudflare_bypass: '14c23ad6-f034-4655-91f2-974904772e6a', // duelbits cloudflare bypass param ;)
}
//settings for csgoempire.com
exports.csgoempire = {
    cookies: '', // csgoempire authentication cookies
    pin: '', // csgoempire pin code
    uuid: '', // csgoempire uuid

    min_price: 0, // minimum price to buy an item
    max_price: 0, // maximum price to buy an item

    expected_roi: 0, // minimum ROI to consider an item as purchasable
};
//settings for skinwallet.com
exports.skinwallet = {
    api_key: '', // shadowpay api key

    item_names: [], // array of csgo market_hash_names to check for

    min_price: 0, // minimum price to buy an item
    max_price: 0, // maximum price to buy an item

    expected_roi: 0, // minimum ROI to consider an item as purchasable
};