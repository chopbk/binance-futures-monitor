const MongoDb = require("./../services/database/mongodb");
const TelegramBot = require("./../services/telegram");
//const CONFIG_TELEGRAM = require("./../config/telegram.cfg");
const logger = require("./../services/utils/logger");
module.exports = async function (eventEmitter, env) {
    let telegramBot, configTelegram;
    const USE_CONFIG = process.env.USE_CONFIG || "db";
    if (USE_CONFIG === "db") {
        configTelegram = await MongoDb.getTelegramConfigModel().findOne({ env: env });
    } else {
        configTelegram = require("../config/telegram.cfg")[env];
    }
    if (!configTelegram)
        throw new Error(
            `[TelegramBotLoader] plesea add api config for ${env} on config/telegram.cfg.js or Database`
        );
    logger.info(`[TelegramBotLoader] Telegram Bot services`);

    telegramBot = new TelegramBot(configTelegram, eventEmitter);
    telegramBot.run();
};
