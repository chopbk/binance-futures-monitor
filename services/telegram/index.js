const logger = require("../utils/logger");
const TelegramBot = require("node-telegram-bot-api");
const Queue = require("../utils/queue");
class TeleBot {
  constructor(CONFIG, eventEmitter) {
    this.config = CONFIG;
    this.token = CONFIG.token;
    this.id_test = CONFIG.id_test;
    this.id_fomo_signal = CONFIG.id_fomo;
    this.id_report = CONFIG.id_report;
    this.id_command = CONFIG.id_command;
    this.id_trailingbot = CONFIG.id_trailingbot || [];
    this.id_elite_signal = CONFIG.id_elite_signal || [];
    this.eventEmitter = eventEmitter;
    this.bot = new TelegramBot(this.token, { polling: CONFIG.listen });
    this.queue = new Queue();
    this.interval = true;
  }
  sendReport(message) {
    this.id_report.forEach((id) => {
      this.bot.sendMessage(id, message); //,{reply_to_message_id: });
    });
    return;
  }
  sendReportCommand(message, cmdInfo) {
    this.bot.sendMessage(cmdInfo.chatId, message, {
      reply_to_message_id: cmdInfo.msgId,
    });
    return;
  }
  run() {
    try {
      let telegramBot = this;
      // Listen for any kind of message. There are different kinds of
      // messages.
      this.bot.on("message", async (msg) => {
        try {
          const chatId = msg.chat.id.toString();
          let messageText = msg.text || msg.caption;
          if (!messageText) return;
          if (this.id_command.includes(chatId) && messageText.startsWith("/")) {
            this.eventEmitter.emit("new_command", messageText.slice(1), {
              msgId: msg.message_id,
              chatId: chatId,
            });
            return;
          }
          if (telegramBot.id_fomo_signal.includes(chatId)) {
            logger.debug(
              `id_fomo_signal  + ${messageText} from ${
                msg.chat.title || msg.chat.username
              } chatId ${chatId} `
            );
            this.eventEmitter.emit(
              "new_signal_message",
              messageText,
              "telegram"
            );
            return;
          }
          // send a message to the chat acknowledging receipt of their message
          return;
        } catch (error) {
          logger.error(`message + ${error}`);
        }
      });
      // maybe get more speed
      this.bot.on("channel_post", async (msg) => {
        let messageText = msg.text || msg.caption;
        if (!messageText) return;
        const chatId = msg.chat.id.toString();
        if (telegramBot.id_fomo_signal.includes(chatId)) {
          logger.debug(`new_signal_message + ${messageText}`);
          this.eventEmitter.emit("new_signal_message", messageText, "telegram");
          return;
        }
        if (telegramBot.id_test.includes(chatId)) {
          this.eventEmitter.emit("new_signal_message", messageText);
          return;
        }
        if (
          this.id_command.includes(chatId.toString()) &&
          messageText.startsWith("/")
        ) {
          this.eventEmitter.emit("new_command", messageText.slice(1), {
            msgId: msg.message_id,
            chatId: chatId,
          });

          return;
        }
        if (telegramBot.id_fomo_signal.includes(chatId)) {
          logger.debug(
            `id_fomo_signal  + ${messageText} from ${
              msg.chat.title || msg.chat.username
            } chatId ${chatId} `
          );
          this.eventEmitter.emit("new_signal_message", messageText, "telegram");
          return;
        }
      });
      this.eventEmitter.addListener("report", (message, env) => {
        let bot = this;
        this.queue.send({
          message: message,
          env: env,
        });
        if (this.interval === true) {
          // start interval
          bot.interval = setInterval(() => {
            if (this.queue.isEmpty()) {
              clearInterval(bot.interval);
              bot.interval = true;
              return;
            } else {
              let item = bot.queue.receive();
              bot.sendReport(
                `[${item.env || process.env.NODE_ENV}]: ${item.message}`
              );
            }
          }, 2003);
        }
      });
      this.eventEmitter.addListener(
        "response_command",
        (message, env, cmdInfo) => {
          this.sendReportCommand(
            `[${env || process.env.NODE_ENV}]: ${message}`,
            cmdInfo
          );
        }
      );
    } catch (error) {
      logger.error(`message + ${error}`);
    }
  }
}

module.exports = TeleBot;
