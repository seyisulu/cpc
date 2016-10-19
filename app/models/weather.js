module.exports = function (opts) {
  var weatherSchema = opts.mongoose.Schema({
        city: { type: String, ref: 'country', required: true, select: true, unique: true },
        data: { type: Object, required: true, select: true },
        date: { type : Date, default: Date.now, select: true }
      });

  weatherSchema.statics.getRecentWeather = function (city, cutoff) {
    return this
      .findOne({ city: city, date: { $gte: cutoff } })
      .exec();
  };

  weatherSchema.statics.saveRecentWeather = function (city, data) {
    return this
      .update({ city: city }, { city: city, date: Date.now(), data: data }, { upsert: true })
      .exec();
  };

  try { // catch multiple calls in tests
    opts.mongoose.model('weather', weatherSchema);
  } catch (error) {}

  return opts.mongoose.model('weather');
};
