const { getFuturesClient } = require("../futures/futures-client");
const logger = require("../utils/logger");
const MqttClient = require("./../mqtt");
class FuturesMonitorCLient {
  constructor() {
    this.client = {};
    this.configApi = {};
    this.profit = {};
    this.fee = {};
  }
  setEvenEmitter(eventEmitter) {
    this.eventEmitter = eventEmitter;
  }
  sendReport(message, env) {
    this.eventEmitter.emit("report", message, env);
  }
  getFuturesMonitorCLient = () => {};
  addFuturesMonitorCLient = () => {};
  startFuturesMonitorCLient = (env) => {
    let futuresClient = getFuturesClient(env);
    futuresClient.websockets.userFutureData(
      (data) => {
        console.log(data);
      },
      (data) => {
        let message, flow, action;
        let updateData = data.updateData;
        if (
          updateData.eventReasonType == "DEPOSIT" ||
          updateData.eventReasonType == "WITHDRAW"
        ) {
          if (updateData.eventReasonType === "DEPOSIT") {
            action = "BƠM";
            flow = "VÀO";
          } else {
            action = "RÚT";
            flow = "RA";
          }
          message = `#${env} ${action} ${
            updateData.balances[0].pnl
          }USDT ${flow} ${new Date(data.eventTime).toISOString()}. Số dư ${
            updateData.balances[0].crossWalletBalance
          } USDT`;
          this.sendReport(message, env);
          logger.debug(message);
        }
      },
      (data) => {
        if (!!proces.env.DEBUG) console.log(data);
        let order = data.order;
        let status = "";
        let message,
          price,
          lastFilledPrice,
          quantity = order.originalQuantity,
          open = false,
          orderType = order.orderType;

        order.positionSide === "LONG"
          ? order.side == "BUY"
            ? (open = true)
            : (open = false)
          : order.side == "SELL"
          ? (open = true)
          : (open = false);
        // only process the order if order has bean excuted
        switch (order.executionType) {
          case "NEW":
          case "CANCELED":
          case "CALCULATED":
          case "EXPIRED":
            return;
          case "TRADE":
            break;
        }
        if (!this.profit[order.symbol]) this.profit[order.symbol] = 0;
        if (!this.fee[order.symbol]) this.fee[order.symbol] = 0;
        // only process the order if order has bean filled or partially filled
        switch (order.orderStatus) {
          case "NEW":
          case "CANCELED":
          case "EXPIRED":
            return;
          case "PARTIALLY_FILLED":
            quantity = order.orderLastFilledQuantity;
            this.profit[order.symbol] += parseFloat(order.realizedProfit);
            this.fee[order.symbol] += parseFloat(order.commission);

            return;
          case "FILLED":
            if (order.orderType === "MARKET") {
              if (
                open === false &&
                (order.originalOrderType === "TAKE_PROFIT_MARKET" ||
                  order.originalOrderType === "STOP_MARKET" ||
                  order.originalOrderType === "MARKET")
              ) {
                // public close position
                MqttClient.publishMessage("position", {
                  symbol: order.symbol,
                  env: env,
                  type: "close",
                });
              }
            }
            this.profit[order.symbol] += parseFloat(order.realizedProfit);
            this.fee[order.symbol] += parseFloat(order.commission);
            break;
          default:
            break;
        }
        price = parseFloat(order.averagePrice);
        lastFilledPrice = order.lastFilledPrice;
        quantity = parseFloat(order.orderFilledAccumulatedQuantity);
        switch (order.originalOrderType) {
          case "MARKET":
            orderType = `MARKET`;
            break;
          case "TAKE_PROFIT_MARKET":
            //market buy
            orderType = `PROFIT`;
            break;
          case "STOP_MARKET":
            orderType = `STOPLOSS`;
            break;
          case "LIMIT":
            price = parseFloat(order.originalPrice);
            orderType = `#LIMIT`;
            break;
          default:
            break;
        }
        message = `#${open ? "MỞ" : "ĐÓNG"}${
          order.closeAll ? "_VỊ_THẾ" : ""
        } #${orderType} #${order.positionSide} ${quantity} #${
          order.symbol
        } PRICE ${price}$ VOLUME ${(quantity * price).toFixed(
          2
        )}$ FEE ${this.fee[order.symbol].toFixed(3)}$ `;
        if (!open)
          message += `${
            this.profit[order.symbol] > 0 ? "PROFIT" : "LOSS"
          } ${this.profit[order.symbol].toFixed(3)}USDT`;
        this.profit[order.symbol] = 0;
        this.fee[order.symbol] = 0;
        this.sendReport(message, env);
        console.log(message);
      },
      console.log,
      console.log
    );
  };
}
module.exports = new FuturesMonitorCLient();
