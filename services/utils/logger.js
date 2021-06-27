const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const CircularJSON = require("circular-json");
var CONFIG = require("../../config/logger.cfg");
// -------------------------------------
//      SETUP LOGGER with Winston
// -------------------------------------
// try to make some pretty output
const alignedWithColorsAndTime = winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint(),
    winston.format.splat(),
    winston.format.simple(),
    winston.format.printf((info) => {
        if (info.message.constructor === Object) {
            info.message = JSON.stringify(info.message, null, 2);
        }
        let { timestamp, level, message, ...args } = info;
        const ts = timestamp.slice(0, 23).replace("T", " ");
        return `${ts} [${level}]: ${message} ${
            Object.keys(args).length ? CircularJSON.stringify(args, null, 2) : ""
        }`;
    })
);

let configOnFile = CONFIG[process.env.NODE_ENV] || CONFIG["default"];
let configLogger = process.env.LOGGER
    ? process.env.LOGGER
    : configOnFile
    ? configOnFile.level
    : "info";
let transport = new winston.transports.DailyRotateFile({
    filename: "logs/%DATE%-app.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    level: configLogger,
});
const logger = winston.createLogger({
    format: alignedWithColorsAndTime,
    transports: transport,
});
if (process.env.NODE_ENV === "test" || configLogger === "debug") {
    logger.add(
        new winston.transports.Console({
            level: "debug",
            format: alignedWithColorsAndTime,
        })
    );
}

module.exports = logger;
