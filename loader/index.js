// load config from .env files
const dotenv = require("dotenv");
dotenv.config();
// const { Worker } = require('worker_threads');

// Import events module
const logger = require("./../services/utils/logger");

// Create an EventEmitter object
const SymbolInfos = require("./../services/utils/symbol-infos");

const { getEventEmitter } = require("../services/utils/event-emitter");
const OpenPositions = require("../services/positions/open-positions");
module.exports = async function () {
    try {
        logger.debug(`[index.loader] env ${process.env}`);
        let env = process.env.NODE_ENV;
        logger.debug(`[index.loader] env ${env}`);
        if (!env) throw new Error("specific env");
        let envTele = process.env.TELE || env;
        let envMqtt = process.env.MQTT || env;
        const multirun = process.env.RUN || env;
        const useConfig = process.env.USE_CONFIG || "db";
        let runs = multirun.split(",");
        logger.debug(`[index.loader] runs ${runs}`);
        let eventEmitter = getEventEmitter();
        if (useConfig === "db")
            // init Database
            await require("./database.loader")();
        // init account config
        await require("./account-config.loader")(runs);

        logger.info(`start application for ${env}`);
        // init MQTT
        await require("./mqtt.loader")(eventEmitter, envMqtt);
        // init telegram for report
        await require("./telegram.loader")(eventEmitter, envTele);
        // create symbol info storage
        await SymbolInfos.init();
        OpenPositions.init(runs);
        // init handle command
        await require("./handle-command.loader")(eventEmitter, runs);
        // init handle signal
        await require("./handle-signal.loader")(eventEmitter, runs);

        // for test
        // eventEmitter.emit(
        //     "new_signal_message",
        //     `#VET Massive News 🚀🚀 Pamp itt
        //     `,
        //     "new"
        // );
    } catch (error) {
        logger.error(`[Loader] ` + error.message);
    }
};
