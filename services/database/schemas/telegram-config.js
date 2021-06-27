const mongoose = require("mongoose");

const Schema = mongoose.Schema;
//Create Schema
const TelegramCfgSchema = new Schema(
    {
        env: {
            type: String,
            index: true,
            unique: true,
        },
        token: String,
        id_test: [String],
        id_fomo: [String],
        id_report: [String],
        id_command: [String],
        id_trailingbot: [String],
        id_elite_signal: [String],
        listen: Boolean,
    },
    {
        versionKey: false,
        timestamps: true,
    }
);
module.exports = TelegramCfgSchema;
