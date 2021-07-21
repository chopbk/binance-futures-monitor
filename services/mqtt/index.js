const logger = require("../utils/logger");
var mqtt = require("mqtt");
class mqttBot {
  constructor() {}
  setConfig(CONFIG) {
    this.config = CONFIG;
    this.messId = false;
  }
  setEventEmitter(eventEmitter) {
    this.eventEmitter = eventEmitter;
  }
  connect() {
    logger.debug(`[MqttBot] connect to ${this.config.url}`);
    this.client = mqtt.connect(this.config.url);
  }
  publishMessage(topic, data) {
    return this.client.publish(topic, JSON.stringify(data));
  }
  run() {
    try {
      let typeSignal;
      logger.debug(`[MqttBot] connect to ${this.config.url}`);
      this.client = mqtt.connect(this.config.url);
      let topics = this.config.topics;

      this.client.on("connect", () => {
        logger.warn(`[${process.env.NODE_ENV}] client 1`);
        for (let topic in topics) {
          logger.warn(`[${process.env.NODE_ENV}] subscribe ${topics[topic]}`);
          this.client.subscribe(topics[topic]);
        }
      });
      this.client.on("message", (topic, message) => {
        let topics = topic.split("/");
        message = message.toString();
        if (message.startsWith(this.messId)) {
          logger.debug(`This mess has received ${message} ${this.messId}`);
          return;
        }
        typeSignal = topics[1];
        this.eventEmitter.emit(topics[0], message, typeSignal);
        if (topic !== "new_command" && message.length > 16)
          this.messId = message.substring(0, 15);

        logger.debug(`message ${message} topic ${topic}`);
      });
      if (!!this.config.externalUrl) {
        logger.debug(`[MqttBot] connect to ${this.config.externalUrl}`);
        this.client2 = mqtt.connect(this.config.externalUrl);
        this.client2.on("connect", () => {
          logger.warn(`[${process.env.NODE_ENV}] client 2`);
          for (let topic in topics) {
            if (topics[topic] !== "new_command") {
              logger.warn(
                `[${process.env.NODE_ENV}] subscribe ${topics[topic]}`
              );
              this.client2.subscribe(topics[topic]);
            }
          }
        });
        this.client2.on("message", (topic, message) => {
          let topics = topic.split("/");
          message = message.toString();
          typeSignal = topics[1];
          if (message.startsWith(this.messId)) {
            logger.debug(`This mess has received ${message} ${this.messId}`);
            return;
          }

          this.eventEmitter.emit(topics[0], message, typeSignal);
          if (topic !== "new_command" && message.length > 16)
            this.messId = message.substring(0, 15);

          logger.debug(`message ${message} topic ${topic}`);
        });
      }
    } catch (error) {
      logger.error(error.message);
    }
  }
}

module.exports = new mqttBot();
