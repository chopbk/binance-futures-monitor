const mongoose = require("mongoose");

const Schema = mongoose.Schema;
//Create Schema
const MqttSchema = new Schema(
    {
        env: {
            type: String,
            index: true,
            unique: true,
        },
        topics: {
            type: [String],
        },
        url: String,
        externalUrl: String,
    },
    {
        versionKey: false,
        timestamps: true,
    }
);
module.exports = MqttSchema;
