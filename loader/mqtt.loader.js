const MqttClient = require("./../services/mqtt");
const logger = require("./../services/utils/logger");
const MongoDb = require("./../services/database/mongodb");
module.exports = async function (eventEmitter, env) {
  let configMQTT = await MongoDb.getMqttConfigModel().findOne({
    env: env,
  });
  if (!configMQTT)
    configMQTT = await MongoDb.getMqttConfigModel().findOne({
      env: "default",
    });
  if (!configMQTT)
    throw new Error(
      `[MqttLoader] plesea add api config for ${env} on config/mqtt.cfg.js or Database`
    );
  MqttClient.setConfig(configMQTT);
  MqttClient.setEventEmitter(eventEmitter);
  logger.debug(`[MqttLoader] Mqtt Config`, configMQTT.topics);
  MqttClient.connect();
  return MqttClient;
};
