const MongoDb = require("./../services/database/mongodb");

module.exports = async function () {
    await MongoDb.init();
};
