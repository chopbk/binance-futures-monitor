/**
 * @file  create connection of mongooDB
 * @author tamnd12
 * @date 19/02/2020
 */
const CFG = require("../../config/db.cfg");
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const AccountConfigSchema = require("./schemas/account-config");
const FuturesSymbolSchema = require("./schemas/futures-symbol");
const TelegramConfigSchema = require("./schemas/telegram-config");

class MongoDb {
  constructor(config = CFG) {
    this.config = config;
  }
  async init() {
    try {
      let url = process.env.MONGODB || this.config.url;
      logger.debug("[mongoLoader] connect to " + url);
      await mongoose.connect(url, this.config.options);
      this.AccountConfigModel = mongoose.model(
        "Account_Config",
        AccountConfigSchema
      );
      this.TelegramConfigModel = mongoose.model(
        "Telegram_Config",
        TelegramConfigSchema
      );
      this.FuturesSymbolModel = mongoose.model(
        "Futures_Symbol",
        FuturesSymbolSchema
      );
    } catch (error) {
      throw error;
    }
    return mongoose.connection;
  }
  getAccountConfigModel() {
    return this.AccountConfigModel;
  }
  getTelegramConfigModel() {
    return this.TelegramConfigModel;
  }
  getFuturesSymbolModel() {
    return this.FuturesSymbolModel;
  }
}
module.exports = new MongoDb();
