module.exports = function (opts) {
  var citySchema = opts.mongoose.Schema({
        _id: { type: String, required: true, select: true, unique: true },
        name: { type: String, required: true, select: true, index: true },
        country: { type: String, required: true, select: true },
        coord: {
          lng: { type: Number, required: true, select: true },
          lat: { type: Number, required: true, select: true }
        }
      });

  citySchema.static('findByName', function (name) {
    return this
      .find({ name: { '$regex': name, '$options': 'i' } })
      .limit(10)
      .sort('name country')
      .exec();
  });

  citySchema.static('findByCoords', function (coord) {
  return this
    .find({ coord: { $near: { $geometry: { type: 'Point', coordinates: coord }, $maxDistance: 25000 } } })
    .limit(10)
    .sort('name country')
    .exec();
  });

  try { // catch multiple calls in tests
    opts.mongoose.model('city', citySchema);
  } catch (error) {}

  opts.mongoose.model('city').collection.ensureIndex({ coord: '2dsphere' });

  opts.mongoose.connection.on('connected', function () {
    opts.mongoose.model('city').collection.count(function(err, count) {
      if( 0 === count ) {
        opts.log.log('No city found');
        opts.mongoose.model('city').collection.insert(require('./cities'), function (err, val) {
          if (err) opts.log.error('Error seeding city data');
          else opts.log.info('Successfully seeded city data');
        });
      } else opts.log.log(count + ' cities available');
    });
  });

  return opts.mongoose.model('city');
};
