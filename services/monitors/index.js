const { getFuturesClient } = require("../futures/futures-client");
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
        console.log(data);
      },
      (data) => {
        console.log(data.updateData.eventReasonType);
        console.log(data.updateData.balances);
        console.log(data.updateData.positions);
      },
      (data) => {
        console.log(data);
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
            status += "đã hủy ";
            break;
          case "CALCULATED":
            break;
          case "EXPIRED":
            status += "đã hết hạn ";
          case "TRADE":
            break;
        }
        switch (order.orderStatus) {
          case "NEW":
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
            if (order.orderStatus == "NEW") return;
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
            if (open) orderType += `#LIMIT (Mở vị thế)`;
            else orderType = `#Chốt_lãi_LIMIT`;
            break;
          case "CANCELED":
            break;
          case "EXPIRED":
            break;
          default:
            break;
        }
        message = ` [#${order.positionSide}]  Lệnh ${order.side} ${orderType} ${quantity} #${order.symbol} Price=${price}$ ${status} `;
        this.sendReport(message, env);
        console.log(message);
      },
      console.log,
      console.log
    );
  };
}
module.exports = new FuturesMonitorCLient();
