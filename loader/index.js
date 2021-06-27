// load config from .env files
const dotenv = require("dotenv");
dotenv.config();
// const { Worker } = require('worker_threads');

// Import events module
const logger = require("./../services/utils/logger");

const SymbolInfos = require("./../services/futures/futures-symbol");
const FuturesPrice = require("../services/futures/futures-prices");
// Create an EventEmitter object
const { getEventEmitter } = require("../services/utils/event-emitter");
const { getFuturesClient } = require("../services/futures/futures-client");
const monitorClient = require("../services/monitors");
module.exports = async function () {
  try {
    let env = process.env.NODE_ENV;
    logger.debug(`[index.loader] env ${env}`);
    if (!env) throw new Error("specific env");
    let envTele = process.env.TELE || env;
    let envMqtt = process.env.MQTT || env;
    const multirun = process.env.RUN || env;
    const useConfig = process.env.USE_CONFIG || "db";
    let runs = multirun.split(",");
    let eventEmitter = getEventEmitter();
    // init Database
    await require("./database.loader")();
    // init account config
    await require("./account-config.loader")(runs);
    logger.warn(`[${process.env.NODE_ENV}] start application for ${runs}`);
    logger.warn(`[${env}] TELE: ${envTele} MQTT: ${envMqtt} `);
    // init telegram for report
    await require("./telegram.loader")(eventEmitter, envTele);
    // create symbol info storage
    await SymbolInfos.init();
    // auto save price
    await FuturesPrice.init();
    monitorClient.setEvenEmitter(eventEmitter);
    runs.map(async (env) => {
      monitorClient.startFuturesMonitorCLient(env);
    }
    
  } catch (error) {
    logger.error(`[Loader] ` + error.message);
  }
};
