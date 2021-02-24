const MongoDb = require("../services/database/mongodb");
const { setConfigFromDb } = require("../services/futures/futures-config");
const { setLanguage } = require("../services/utils/language");
const { addFuturesClient } = require("../services/futures/futures-client");
const tradeConfig = require("../config/futures.cfg.json");
const apiConfig = require("../config/api.cfg.json");
const langConfig = require("../config/lang.cfg.js");
const USE_CONFIG = process.env.USE_CONFIG || "db";
let config = {};
module.exports = async function (runs) {
    runs.push("default");
    await Promise.all(
        runs.map(async (env) => {
            if (USE_CONFIG === "db")
                config = await MongoDb.getAccountConfigModel().findOne({ env: env });
            else {
                if (!apiConfig[env])
                    throw new Error(
                        `[Account-Config-Loader] plesea add api config for ${env} on config/api.cfg.json`
                    );
                if (!tradeConfig[env])
                    throw new Error(
                        `[Account-Config-Loader] plesea add trade config for ${env} on config/futures.cfg.json`
                    );
                config = {
                    trade_config: tradeConfig[env] || tradeConfig.default,
                    api: apiConfig[env],
                    lang: langConfig[env] || langConfig.default,
                };
            }
            setConfigFromDb(env, config.trade_config);
            addFuturesClient(env, config.api);
            setLanguage(env, config.lang);
        })
    );
    runs.pop();
};
