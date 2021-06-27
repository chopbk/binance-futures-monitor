const logger = require("../../utils/logger");
const Binance = require("./lib");

function binanceFutures(options) {
    const binance = new Binance(options);
    binance.exchange = "binance";
    binance.futuresOpenShort = async (symbol, price = 0, quantity) => {
        return binance.futuresOrder("SELL", symbol, quantity, price, {
            positionSide: "SHORT",
            type: price ? "LIMIT" : "MARKET",
        });
    };
    binance.futuresTakeProfitShort = async (symbol, stopPrice, quantity = 0) => {
        return binance.futuresOrder("BUY", symbol, quantity, false, {
            positionSide: "SHORT",
            type: "TAKE_PROFIT_MARKET",
            closePosition: true,
            stopPrice: stopPrice,
            quantity: 0,
            workingType: "CONTRACT_PRICE",
        });
    };
    binance.futuresLimitCloseShort = async (symbol, price, quantity = 0) => {
        return binance.futuresOrder("BUY", symbol, quantity, false, {
            positionSide: "SHORT",
            type: "LIMIT",
            price: price,
            quantity: quantity,
        });
    };

    binance.futuresStopLossShort = async (symbol, stoplossPrice, quantity = 0) => {
        return binance.futuresOrder("BUY", symbol, quantity, false, {
            positionSide: "SHORT",
            type: "STOP_MARKET",
            closePosition: true,
            stopPrice: stoplossPrice,
            workingType: "MARK_PRICE",
            quantity: 0,
        });
    };
    binance.futuresStopLimitShort = async (symbol, price, stoplossPrice, quantity = 0) => {
        return binance.futuresOrder("BUY", symbol, quantity, false, {
            positionSide: "SHORT",
            type: "STOP",
            price: price,
            stopPrice: stoplossPrice,
            quantity: quantity,
            priceProtect: true,
            workingType: "MARK_PRICE",
        });
    };
    binance.futuresMarketCloseShort = async (symbol, quantity = 0) => {
        return binance.futuresOrder("BUY", symbol, quantity, false, {
            positionSide: "SHORT",
            type: "MARKET",
            quantity: quantity,
            workingType: "CONTRACT_PRICE",
        });
    };

    // Long
    binance.futuresOpenLong = async (symbol, price = 0, quantity) => {
        return binance.futuresOrder("BUY", symbol, quantity, price, {
            positionSide: "LONG",
            type: price ? "LIMIT" : "MARKET",
        });
    };
    binance.futuresTakeProfitLong = async (symbol, stopPrice, quantity = 0) => {
        return binance.futuresOrder("SELL", symbol, quantity, false, {
            positionSide: "LONG",
            type: "TAKE_PROFIT_MARKET",
            closePosition: true,
            workingType: "CONTRACT_PRICE",
            stopPrice: stopPrice,
            quantity: 0,
        });
    };
    binance.futuresLimitCloseLong = async (symbol, price, quantity = 0) => {
        return binance.futuresOrder("SELL", symbol, quantity, false, {
            positionSide: "LONG",
            type: "LIMIT",
            price: price,
            quantity: quantity,
            workingType: "CONTRACT_PRICE",
        });
    };
    binance.futuresStopLossLong = async (symbol, stoplossPrice, quantity = 0) => {
        return binance.futuresOrder("SELL", symbol, quantity, false, {
            positionSide: "LONG",
            type: "STOP_MARKET",
            closePosition: true,
            stopPrice: stoplossPrice,
            quantity: 0,
            workingType: "MARK_PRICE",
        });
    };
    binance.futuresStopLimitLong = async (symbol, price, stoplossPrice, quantity = 0) => {
        return binance.futuresOrder("SELL", symbol, quantity, false, {
            positionSide: "LONG",
            type: "STOP",
            price: price,
            stopPrice: stoplossPrice,
            quantity: quantity,
            priceProtect: true,
            workingType: "MARK_PRICE",
        });
    };
    binance.futuresMarketCloseLong = async (symbol, quantity = 0) => {
        return binance.futuresOrder("SELL", symbol, quantity, false, {
            positionSide: "LONG",
            type: "MARKET",
            quantity: quantity,
            workingType: "CONTRACT_PRICE",
        });
    };
    binance.futuresGetSymbolPrice = async (symbol) => {
        let futuresPrices = await binance.futuresPrices();
        if (futuresPrices) return parseFloat(futuresPrices[symbol]);
        else return 0;
    };
    // order
    binance.futuresGetAllOrdersOfSymbol = async (symbol, side = false) => {
        try {
            const allOpenOrders = await binance.futuresOpenOrders(symbol);
            const orders = allOpenOrders.filter((o) => o.positionSide === side);
            return !!side ? orders : allOpenOrders;
        } catch (error) {
            return [];
        }
    };
    binance.futuresCancelAllOrdersOfSymbol = async (symbol, side) => {
        try {
            const allOpenOrders = await binance.futuresGetAllOrdersOfSymbol(symbol, side);
            let orderIds = allOpenOrders.map((o) => o.orderId);
            if (orderIds.length !== 0) return binance.futuresCancelMultipleOrders(symbol, orderIds);
            return;
        } catch (error) {
            logger.error(error.message);
        }
    };
    binance.futuresCancelMultiOrderOfSymbol = async (symbol, orderIds) => {
        return binance.futuresCancelMultipleOrders(symbol, orderIds);
    };
    // positions
    binance.futuresGetAllPositions = async (symbol = false, side = false) => {
        try {
            const positions = await binance.futuresPositionRisk();

            let p = !!positions.code
                ? []
                : positions.filter((position) => parseFloat(position.positionAmt) !== 0);
            if (!!side) p = p.filter((position) => position.positionSide === side);
            if (!!symbol) {
                p = p.filter((position) => position.symbol === symbol);
            }
            return p;
        } catch (error) {
            throw error;
        }
    };
    // positions
    binance.futuresGetOpenPositionBySymbolAndSide = async (symbol = true, side = true) => {
        try {
            const positions = await binance.futuresGetAllPositions(symbol, side);
            let p = positions.length !== 0 ? positions[0] : false;
            return p;
        } catch (error) {
            throw error;
        }
    };
    binance.makeOrderParams = (symbol, side, quantity, price, type) => {
        let params = {};
        params.side = side === "LONG" ? "SELL" : "BUY";
        params.symbol = symbol;
        params.positionSide = side;
        params.timeInForce = "GTC";
        if (quantity) params.quantity = quantity.toString();
        switch (type) {
            case "LIMIT":
                params.price = price.toString();
                params.type = "LIMIT";
                break;
            case "PROFIT":
                params.stopPrice = price.toString();
                params.type = "TAKE_PROFIT_MARKET";
                params.closePosition = "true";
                break;
            case "STOPLOSS":
                params.stopPrice = price.toString();
                params.type = "STOP_MARKET";
                params.closePosition = "true";
                break;
        }

        return params;
    };
    binance.futuresAccountBalance = async () => {
        try {
            const accountBalances = await binance.futuresBalance();
            return accountBalances.find((b) => b.asset == "USDT");
        } catch (error) {
            throw error;
        }
    };
    return binance;
}

module.exports = binanceFutures;
