const { getFuturesClient } = require("./futures-client");
class FuturesPrice {
    constructor() {
        this.prices = {};
    }
    init = async () => {
        this.futuresClient = await getFuturesClient("default");
        let prices = this.prices;
        // Get 24h price change statistics for all symbols
        this.futuresClient.futuresMiniTickerStream(false, (datas) => {
            datas.map((data) => {
                prices[data.symbol] = data.close;
            });
        });
    };
    getSymbolPrice = (symbol) => {
        return parseFloat(this.prices[symbol]);
    };
}
module.exports = new FuturesPrice();
