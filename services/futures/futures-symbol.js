const MongoDb = require("../database/mongodb");
const logger = require("./../utils/logger");

class SymbolInfo {
    constructor() {
        this.symbolInfos = [];
        this.symbols = [];
    }
    async init(exchange) {
        await this.setSymbolInfos(false, exchange);
        return;
    }
    async setSymbolInfos(update = false, exchange = "binance") {
        try {
            logger.debug(`[SymbolInfoInit] setSymbolInfos`);
            this.symbolInfos = await MongoDb.getFuturesSymbolModel().find({ exchange: exchange });
            if (!this.symbolInfos || this.symbolInfos.length === 0 || update === true) {
                throw new Error("please check futures symbol table in Database");
            }
            this.symbols = this.symbolInfos.map((e) => {
                return e.symbol;
            });
            return;
        } catch (error) {
            logger.error(`[getSymbolInfos] error: ${error.message}`);
        }
    }
    getSymbolInfo(symbol) {
        let symbolInfo = this.symbolInfos.find((exchangeInfo) => {
            return exchangeInfo.symbol == symbol;
        });
        return {
            symbol: symbolInfo.symbol,
            tickSize: symbolInfo.tickSize,
            stepSize: symbolInfo.stepSize,
        };
    }
    getSymbolList() {
        return this.symbols;
    }
    isSymbolExist(symbol) {
        return this.symbols.find((s) => s === symbol);
    }
    getTickSizeOfSymbol(symbol) {
        let symbolInfo = this.getSymbolInfo(symbol);
        if (symbolInfo) {
            return parseFloat(symbolInfo.tickSize);
        }
        return 0;
    }
    getStepSizeOfSymbol(symbol) {
        let symbolInfo = this.getSymbolInfo(symbol);
        if (symbolInfo) {
            return parseFloat(symbolInfo.stepSize);
        }
        return 0;
    }
}
module.exports = new SymbolInfo();
