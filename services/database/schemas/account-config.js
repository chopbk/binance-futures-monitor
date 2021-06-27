const mongoose = require("mongoose");

const Schema = mongoose.Schema;
//Create Schema
const ConfigSchema = new Schema(
    {
        env: {
            type: String,
            index: true,
            unique: true,
        },
        exchange: String,
        api: {
            api_key: String,
            api_secret: String,
            hedgeMode: {
                type: Boolean,
                default: true,
            },
            password: String,
        },
        lang: {
            type: String,
            enum: ["en", "vi"],
            default: "vi",
        },
        trade_config: {
            FIX_COST_AMOUNT: {
                type: Number,
                default: 100,
            },
            FIX_LEVERAGE: {
                type: Number,
                default: 20,
            },
            LONG_LEVERAGE: {
                type: Number,
                default: 20,
            },
            SHORT_LEVERAGE: {
                type: Number,
                default: 20,
            },
            CLOSE_TP_PERCENT: {
                type: Number,
                default: 1,
            },
            TP_PERCENT: {
                type: Array,
                default: [0.3, 1],
            },
            SP_PERCENT: {
                type: Number,
                default: 0.1,
            },
            SP_PERCENT_TRIGGER: {
                type: Number,
                default: 0.5,
            },
            SL_PERCENT: {
                type: Number,
                default: -0.3,
            },
            R_PERCENT: {
                type: Number,
                default: 0.2,
            },
            INTERVAL: {
                type: Number,
                default: 60,
            },
            NUM_TRAILING: {
                type: Number,
                default: 5,
            },
            TRAILING: {
                type: Boolean,
                default: true,
            },
            ON: {
                type: Boolean,
                default: true,
            },
            LONG: {
                type: Boolean,
                default: true,
            },
            SHORT: {
                type: Boolean,
                default: false,
            },
            INVERT: {
                type: Boolean,
                default: false,
            },
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);
module.exports = ConfigSchema;
