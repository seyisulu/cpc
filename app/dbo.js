module.exports = function (opts) {
  opts.mongoose
  .connect(process.env.DB_URL, { db: { safe: { w: 1, journal: true, wtimeout: 10000 } }, config: { autoIndex: true } });
  opts.mongoose.connection.on('error', function mongooseConnected() {
    opts.log.error('Mongoose connection error: plese verify that mongod is running');
    opts.log.error(error);
  });
  opts.mongoose.connection.once('open', function mongooseOpened() {
    opts.log.info('Mongoose connected to the database');
  });

  var dbo = {
    City: require('./models/city')({ mongoose: opts.mongoose, log: opts.log }),
    Weather: require('./models/weather')({ mongoose: opts.mongoose, log: opts.log })
  };

  return dbo;
};
