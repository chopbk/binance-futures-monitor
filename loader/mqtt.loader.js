const MqttClient = require("./../services/mqtt");
const CONFIG_MQTT = require("./../config/mqtt.cfg");
const logger = require("./../services/utils/logger");
const MongoDb = require("./../services/database/mongodb");
module.exports = async function (eventEmitter, env) {
    const USE_CONFIG = process.env.USE_CONFIG || "db";
    let configMQTT = CONFIG_MQTT[env] || CONFIG_MQTT.default;
    if (USE_CONFIG === "db") {
        configMQTT = await MongoDb.getMqttConfigModel().findOne({
            env: env,
        });
        if (!configMQTT)
            configMQTT = await MongoDb.getMqttConfigModel().findOne({
                env: "default",
            });
    }
    if (!configMQTT)
        throw new Error(
            `[MqttLoader] plesea add api config for ${env} on config/mqtt.cfg.js or Database`
        );
    MqttClient.setConfig(configMQTT);
    MqttClient.setEventEmitter(eventEmitter);
    logger.info(`[MqttLoader] Mqtt services`);
    logger.debug(`[MqttLoader] Mqtt Config`, configMQTT.topics);
    MqttClient.run();
    return MqttClient;
};
