// load config from .env files
const dotenv = require("dotenv");
dotenv.config();
// const { Worker } = require('worker_threads');

// Import events module
const logger = require("./../services/utils/logger");

// Create an EventEmitter object
const SymbolInfos = require("./../services/utils/symbol-infos");
const { getFuturesClient } = require("../services/futures/futures-client");
const { getEventEmitter } = require("../services/utils/event-emitter");
let futuresClient = getFuturesClient("default");
module.exports = async function () {
    try {
        let env = process.env.NODE_ENV;
        let typeSignal = "rose";
        if (!env) throw new Error("specific env");
        let envTele = process.env.TELE || env;
        let envMqtt = process.env.MQTT || env;
        const useConfig = process.env.USE_CONFIG || "db";
        let eventEmitter = getEventEmitter();
        if (useConfig === "db")
            // init Database
            await require("./database.loader")();
        // init account config
        await require("./account-config.loader")([]);

        logger.info(`start application for ${env}`);
        // init MQTT
        const MqttClient = await require("./mqtt.loader")(eventEmitter, envMqtt);
        // init telegram for report
        await require("./telegram.loader")(eventEmitter, envTele);
        // create symbol info storage
        await SymbolInfos.init();
        logger.debug("[SignalPublishLoader Init Sucess]");
        const SignalProcess = require("../services/signals/process");
        let signalInfo;
        eventEmitter.addListener("new_rose_signal", async (message) => {
            typeSignal = "rose";
            signalInfo = await SignalProcess.processSignalMessage(message, typeSignal);
            if (!signalInfo.side || !signalInfo.symbol) return;
            signalInfo.typeSignal = typeSignal;
            signalInfo.currentPrice = parseFloat(
                await futuresClient.futuresGetSymbolPrice(signalInfo.symbol)
            );
            MqttClient.publishMessage("new_signal", signalInfo);
        });
        eventEmitter.addListener("new_bull_signal", async (message) => {
            typeSignal = "bull";
            signalInfo = await SignalProcess.processSignalMessage(message, typeSignal);
            if (!signalInfo.side || !signalInfo.symbol) return;
            signalInfo.typeSignal = typeSignal;
            MqttClient.publishMessage("new_signal", signalInfo);
        });
        eventEmitter.addListener("new_alan_signal", async (message) => {
            typeSignal = "alan";
            signalInfo = await SignalProcess.processSignalMessage(message, typeSignal);
            if (!signalInfo.side || !signalInfo.symbol) return;
            signalInfo.typeSignal = typeSignal;
            MqttClient.publishMessage("new_signal", signalInfo);
        });
        eventEmitter.addListener("new_shelby_signal", async (message) => {
            typeSignal = "shelby";
            signalInfo = await SignalProcess.processSignalMessage(message, typeSignal);
            if (!signalInfo.side || !signalInfo.symbol) return;
            signalInfo.typeSignal = typeSignal;
            MqttClient.publishMessage("new_signal", signalInfo);
        });
        eventEmitter.addListener("new_vip_binance_signal", async (message) => {
            typeSignal = "vip_binance";
            signalInfo = await SignalProcess.processSignalMessage(message, typeSignal);
            if (!signalInfo.side || !signalInfo.symbol) return;

            signalInfo.typeSignal = typeSignal;
            MqttClient.publishMessage("new_signal", signalInfo);
        });
        eventEmitter.addListener("new_command", async (command, cmdInfo) => {
            logger.debug(command);
            MqttClient.publishMessage("new_command", {
                command,
                cmdInfo,
            });
        });
    } catch (error) {
        logger.error(`[Loader] ` + error.message);
    }
};
