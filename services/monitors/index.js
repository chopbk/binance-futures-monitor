const { getFuturesClient } = require("../futures/futures-client");
const logger = require("../utils/logger");
class FuturesMonitorCLient {
  constructor() {
    this.client = {};
    this.configApi = {};
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
        logger.debug(data);
      },
      (data) => {
        logger.debug(data.updateData.eventReasonType);
        logger.debug(data.updateData.balances);
        logger.debug(data.updateData.positions);
      },
      (data) => {
        logger.debug(data);
        let order = data.order;
        let status = "";
        let message,
          price,
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

        switch (order.executionType) {
          case "NEW":
            status += `đã ${open ? "mở" : "đặt"} thành công`;
            break;
          case "CANCELED":
            return;
            status += "đã hủy ";
            break;
          case "CALCULATED":
            break;
          case "EXPIRED":
            return;
            status += "đã hết hạn ";
          case "TRADE":
            break;
        }
        switch (order.orderStatus) {
          case "NEW":
            if (order.orderType !== "STOP_MARKET") return;
            break;
          case "PARTIALLY_FILLED":
            status += `đã khớp một phần.`;
            quantity = order.orderLastFilledQuantity;
            if (open !== true) status += ` Lãi/Lỗ ${order.realizedProfit}$.`;
            else return;
            break;
          case "FILLED":
            status += `đã khớp toàn bộ.`;
            if (order.orderType === "MARKET")
              status += ` Giá khớp gần nhất: ${order.lastFilledPrice}$.`;
            if (open !== true) status += ` Lãi/Lỗ ${order.realizedProfit}$.`;

            break;
          case "CANCELED":
            break;
          case "EXPIRED":
            return;
          default:
            break;
        }

        switch (order.orderType) {
          case "MARKET":
            price = order.averagePrice;
            //if (order.orderStatus == "NEW") return;
            //if (order.orderStatus == "PARTIALLY_FILLED") return;
            break;
          case "STOP_MARKET":
            price = order.stopPrice;
            quantity = "";
            orderType = `#STOPLOSS`;
            break;
          case "TAKE_PROFIT_MARKET":
            price = order.stopPrice;
            quantity = "";
            orderType = `#Chốt_lãi_MARKET)`;
            break;
          case "LIMIT":
            price = order.originalPrice;
            if (open) orderType = `#LIMIT (Mở vị thế)`;
            else orderType = `#Chốt_lãi_LIMIT`;
            break;
          case "CANCELED":
            break;
          case "EXPIRED":
            break;
          default:
            break;
        }
        message = `[${new Date(order.orderTradeTime).toISOString()}] [#${
          order.positionSide
        }]  Lệnh ${order.side} ${orderType} ${quantity} #${
          order.symbol
        } Price=${price}$ ${status} `;
        this.sendReport(message, env);
        logger.debug(message);
      },
      logger.debug,
      logger.debug
    );
  };
}
module.exports = new FuturesMonitorCLient();
