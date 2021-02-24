const logger = require("../services/utils/logger");
const {
    addHandleSignalClient,
    getHandleSignalClient,
} = require("../services/signals/handle-signals-clients");
const { getFuturesClient } = require("../services/futures/futures-client");
const SignalProcess = require("../services/signals/process");
const MongoDb = require("../services/database/mongodb");
const SymbolInfos = require("../services/utils/symbol-infos");
const MqttClient = require("./../services/mqtt");
let futuresClient = getFuturesClient("default");
let { setSignalConfigFromDb } = require("./../services/futures/futures-config");
module.exports = async function (eventEmitter, runs) {
    let envs = runs;
    logger.info(`[HandleSingalLoader] ${runs}`);
    let signalConfig = {};
    const USE_CONFIG = process.env.USE_CONFIG || "db";
    // get signal config for every env in runs
    if (USE_CONFIG === "db") {
        await Promise.all(
            envs.map(async (env) => {
                let envSignal = env;
                signalConfig[env] = await MongoDb.getSignalConfig().findOne({ env: envSignal });
                if (!signalConfig[env]) envSignal = process.env.SIGNAL || "default";
                signalConfig[env] = await MongoDb.getSignalConfig().findOne({ env: envSignal });
            })
        );
    } else {
        envs.map((env) => {
            signalConfig[env] = require("../config/signal.cfg").default || {};
        });
    }
    // init client
    envs.map((env) => {
        addHandleSignalClient(eventEmitter, env, signalConfig[env]);
        setSignalConfigFromDb(env, signalConfig[env].type_signal);
        logger.info(signalConfig[env].type_signal);
    });
    // if we have new message
    eventEmitter.addListener("new_signal_message", async (message, typeSignal) => {
        processSignal(message, typeSignal);
    });

    eventEmitter.addListener("new_signal", async (signalInfo) => {
        signalInfo = JSON.parse(signalInfo);
        calllHandleSignalBot(signalInfo);
    });

    const processSignal = async (message, typeSignal = "rose") => {
        let signalInfo = await SignalProcess.processSignalMessage(message, typeSignal);

        if (!signalInfo.side || !signalInfo.symbol) return;
        signalInfo.typeSignal = typeSignal;
        signalInfo.currentPrice = parseFloat(
            await futuresClient.futuresGetSymbolPrice(signalInfo.symbol)
        );
        if (process.env.PUBLISH == "true") {
            MqttClient.publishMessage("new_signal", signalInfo);
        }
        calllHandleSignalBot(signalInfo);
    };
    const calllHandleSignalBot = async (signalInfo) => {
        let botFutures = [],
            handleSignalClients;
        try {
            signalInfo.symbolInfo = SymbolInfos.getSymbolInfo(signalInfo.symbol);
            if (!signalInfo.symbol || !signalInfo.side) {
                logger.info(`not valid signal ${signalInfo}`);
                return false;
            }
            handleSignalClients = envs.map((env) => getHandleSignalClient(env));
            handleSignalClients = handleSignalClients.filter((handleSignalClient) =>
                handleSignalClient.checkBotStatus(signalInfo)
            );
            botFutures = handleSignalClients.map((handleSignalClient) => {
                return handleSignalClient.createNewBotFutures(signalInfo);
            });
            await Promise.allSettled(botFutures.map((bot) => bot.preOpenNewPosition()));
            await Promise.allSettled(botFutures.map((bot) => bot.openNewPosition()));
            await Promise.allSettled(botFutures.map((bot) => bot.afterOpenNewPosition()));
        } catch (error) {
            logger.error(`[calllHandleSignalBot] ${error.message}`);
        }
    };
};
