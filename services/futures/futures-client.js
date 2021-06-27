const BinanceFutures = require("./binance");
class FuturesClient {
  constructor() {
    this.client = {};
    this.configApi = {};
  }
  getFuturesClient = (env) => {
    if (!env) throw new Error("[getFuturesClient] parameter env is needed");
    if (!this.client[env])
      throw new Error("[getFuturesClient] Futures Client not exist");
    return this.client[env];
  };
  addFuturesClient = (env, config, exchange) => {
    if (!env) throw new Error("[addFuturesClient] parameter env is needed");
    if (!config) throw new Error(`[addFuturesClient] no config for ${env}`);
    if (!!this.client[env]) return this.client[env];
    switch (exchange) {
      case "binance":
        this.configApi[env] = {
          APIKEY: config.api_key,
          APISECRET: config.api_secret,
          hedgeMode: config.hedgeMode || true,
        };
        this.client[env] = new BinanceFutures(this.configApi[env]);
        break;
      case "kucoin":
        this.configApi[env] = {
          apiKey: config.api_key,
          secretKey: config.api_secret,
          passphrase: config.password,
          environment: "live",
        };
        this.client[env] = new KucoinFutures();
        this.client[env].init(this.configApi[env]);
        break;
    }
  };
}
module.exports = new FuturesClient();
