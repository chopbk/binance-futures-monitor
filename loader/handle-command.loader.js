const { addHandleCommandClient } = require("../services/commands/handle-commands-clients");
const logger = require("../services/utils/logger");
const MqttClient = require("./../services/mqtt");
module.exports = async function (eventEmitter, runs) {
    let envs = runs;
    logger.info(`[HandleCommandLoader] ${runs}`);
    let handleCommandBots = envs.map((env) => {
        return addHandleCommandClient(eventEmitter, env);
    });
    function parseCommand(str, cmdInfo) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return {
                command: str,
                cmdInfo: cmdInfo,
            };
        }
    }
    // Listen for any kind of message. There are different kinds of
    eventEmitter.addListener("new_command", async (command, cmdInfo) => {
        let messageObject = parseCommand(command, cmdInfo);
        if (process.env.PUBLISH == "true") {
            MqttClient.publishMessage("new_command", {
                command,
                cmdInfo,
            });
        }
        await Promise.all(
            handleCommandBots.map((handleCommandBot) => {
                return handleCommandBot.handleCommandMessage(
                    messageObject.command,
                    messageObject.cmdInfo
                );
            })
        );
    });
};
