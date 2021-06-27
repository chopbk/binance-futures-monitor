const MongoDb = require("../services/database/mongodb");
const { addFuturesClient } = require("../services/futures/futures-client");
module.exports = async function (runs) {
  runs.push("default");
  await Promise.all(
    runs.map(async (env) => {
      let config = {};
      config = await MongoDb.getAccountConfigModel().findOne({ env: env });
      if (!config)
        throw new Error(
          `[Account-Config-Loader] plesea add api config for ${env} on DB`
        );
      addFuturesClient(env, config.api, config.exchange);
    })
  );
  runs.pop();
};
