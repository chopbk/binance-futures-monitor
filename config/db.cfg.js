module.exports = {
  url: "mongodb://localhost:27017/myapp",
  options: {
    poolSize: 10,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: true,
    keepAlive: true,
    useFindAndModify: false,
  },
};
