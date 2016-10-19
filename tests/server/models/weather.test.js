var log       = require('../../../app/log'),
    chai      = require('chai'),
    sinon     = require('sinon'),
    mongoose  = require('mongoose');
    require('sinon-mongoose');
    require('sinon-as-promised');
    require('dotenv').config();

chai.should();
chai.use(require('sinon-chai'));

describe('Weather Mongoose Model (weather)', function () {
  var logMock, mongooseConnStub, weather, weatherMock,
      dbURL = process.env.DB_URL,
      dbOpt = { db: { safe: { w: 1, journal: true, wtimeout: 10000 } }, config: { autoIndex: true } },
      ctyID = 2332453,
      APIrx = {
        'coord': {
          'lon': 3.75,
          'lat': 6.58
        },
        'weather': [
          {
            'id': 802,
            'main': 'Clouds',
            'description': 'scattered clouds',
            'icon': '03n'
          }
        ],
        'base': 'stations',
        'main': {
          'temp': 298.771,
          'pressure': 1019.85,
          'humidity': 96,
          'temp_min': 298.771,
          'temp_max': 298.771,
          'sea_level': 1024.73,
          'grnd_level': 1019.85
        },
        'wind': {
          'speed': 3.01,
          'deg': 226.503
        },
        'clouds': {
          'all': 32
        },
        'dt': 1476667206,
        'sys': {
          'message': 0.0085,
          'country': 'NG',
          'sunrise': 1476682276,
          'sunset': 1476725346
        },
        'id': 2332453,
        'name': 'Lagos State',
        'cod': 200
      };

  before(function () {
    mongooseConnStub = sinon.stub(mongoose, 'connect');
    dbo = require('../../../app/dbo')({ mongoose: mongoose, log: logMock });
    weather = dbo.Weather;
  });

  beforeEach(function () {
    logMock = sinon.mock(log);
    weatherMock = sinon.mock(weather);
  });

  afterEach(function () {
    logMock.restore();
    weatherMock.restore();
  });

  after(function () {
    mongooseConnStub.restore();
  });

  it('#getRecentWeather should query MongoDB with proper options', function (done) {
    var hourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
    weatherMock
      .expects('findOne').withArgs({ city: ctyID, date: { $gte: hourAgo.getTime() } })
      .chain('exec')
      .resolves(APIrx);

    weather.getRecentWeather(ctyID, hourAgo.getTime()).then(function (w) {
      weatherMock.verify();
      w.should.deep.equal(APIrx);
      done();
    });
  });

  it('#saveRecentWeather should upsert as appropriate', function (done) {
    var now = Date.now(),
        dteStub = sinon.stub(Date, 'now', function () { return now; });

    weatherMock
      .expects('update').withArgs({ city: ctyID }, { city: ctyID, data: APIrx, date: now }, { upsert: true })
      .chain('exec')
      .resolves(APIrx);

    weather.saveRecentWeather(ctyID, APIrx).then(function (weather) {
      dteStub.restore();
      weatherMock.verify();
      weather.should.deep.equal(APIrx);
      done();
    });
  });
});
