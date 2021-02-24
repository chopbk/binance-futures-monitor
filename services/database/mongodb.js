/**
 * @file  create connection of mongooDB
 * @author tamnd12
 * @date 19/02/2020
 */
const CFG = require("../../config/db.cfg");
const mongoose = require("mongoose");
const logger = require("../utils/logger");
class MongoDb {
  constructor(config = CFG) {
    this.config = config;
  }
  async init() {
    try {
      let url = process.env.MONGODB || this.config.url;
      logger.debug("[mongoLoader] connect to " + url);
      await mongoose.connect(url, this.config.options);
    } catch (error) {
      throw error;
    }
    return mongoose.connection;
  }
}
module.exports = new MongoDb();
