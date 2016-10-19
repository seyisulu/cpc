var log       = require('../../../app/log'),
    nrc       = require('node-rest-client').Client,
    chai      = require('chai'),
    sinon     = require('sinon'),
    should    = chai.should(),
    mongoose  = require('mongoose');
    require('sinon-mongoose');
    require('sinon-as-promised');
    require('dotenv').config();

chai.use(require('sinon-chai'));

mongoose.Promise = global.Promise;

describe('API version One (apiv1)', function () {
  var logMock, mongooseConnStub, clientMock, city, cityCtrl, cityMock, weather, weatherCtrl, weatherMock,
      dbURL = process.env.DB_URL,
      dbOpt = { db: { safe: { w: 1, journal: true, wtimeout: 10000 } }, config: { autoIndex: true } },
      client = new nrc(),
      ctyID = 2332453,
      ctyFixture = { _id: 2332453, name: 'Lagos State', country: 'NG', coord: { lng: 3.75, lat: 6.58333 } },
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
    city = dbo.City;
    weather = dbo.Weather;
  });

  beforeEach(function () {
    logMock = sinon.mock(log);
    clientMock = sinon.mock(client);
    cityMock = sinon.mock(city);
    cityCtrl = require('../../../app/routes/city.ctrl')({ dbo: dbo });
    weatherMock = sinon.mock(weather);
    weatherCtrl = require('../../../app/routes/weather.ctrl')({ dbo: dbo, client: client });
  });

  afterEach(function () {
    logMock.restore();
    clientMock.restore();
    cityMock.restore();
    weatherMock.restore();
  });

  after(function () {
    mongooseConnStub.restore();
  });

  describe('weatherCtrl.getById Route: /weather/city/:id(\d+)', function () {
    it('should return weather from DB for a valid city if found and within the hour', function getByIdTest(done) {
      var req = { params: { id: ctyID } },
          ago = new Date(Date.now() - 60 * 60 * 1000),
          dte = sinon.stub(Date, 'now', function() { return ago.getTime() + 60 * 60 * 1000; }),
          fxt = { city: ctyID, data: APIrx, date: ago.getTime() },
          res = {
            send: function(){ },
            json: function(dta){
              dte.restore();
              dta.should.deep.equal(fxt.data);
              weatherMock.verify();
              done();
            },
            status: function(responseStatus) {
              responseStatus.should.equal(200);
              return this;
            }
          };
      weatherMock.expects('getRecentWeather').once()
      .withArgs(ctyID, ago.getTime())
      .resolves(fxt);

      weatherCtrl.getById(req, res);
    });
    it('should return hit the API if none in DB and save API result to DB', function getByIdRequest(done) {
      var req = { params: { id: ctyID } },
          ago = new Date(Date.now() - 60 * 60 * 1000),
          dte = sinon.stub(Date, 'now', function() { return ago.getTime() + 60 * 60 * 1000; }),
          fxt = { city: ctyID, data: APIrx, date: ago.getTime() },
          url = process.env.OPENWM_URL,
          key = process.env.OPENWM_KEY,
          qrs = { 'ok': 1, 'nModified': 0, 'n': 1, 'upserted': [{ 'index': 0, '_id': '5806796ede37b7c1a1b1b94c' }] },
          res = {
            send: function(){ },
            json: function(dta){
              try {
                dte.restore();
                should.exist(dta);
                weatherMock.verify();
                clientMock.verify();
                done();
              } catch (e) {
                done(e);
              }
            },
            status: function(responseStatus) {
              responseStatus.should.equal(200);
              return this;
            }
          };
      weatherMock.expects('getRecentWeather').once()
      .withArgs(ctyID, ago.getTime())
      .resolves(null);
      weatherMock.expects('saveRecentWeather').once()
      .withArgs(ctyID, APIrx)
      .resolves(qrs);
      clientMock.expects('get').once()
      .withArgs(url + '?id=${id}&APPID=${key}', { path: { id: ctyID, key: key } })
      .callsArgWith(2, APIrx, res);

      weatherCtrl.getById(req, res);
    });
  });

  describe('cityCtrl.getByCoords Route: /city/:lng/:lat', function () {
    it('should return data for cities closest to coordinates', function (done) {
      var coords = [3.75, 6.58333],
          result = [
            { '_id': 2332453, 'name': 'Lagos State', 'country': 'NG', 'coord': { 'lng': 3.75, 'lat': 6.58333 } },
            { '_id': 2325458, 'name': 'Otta', 'country': 'NG', 'coord': { 'lng': 3.73333, 'lat': 6.66667 } },
            { '_id': 2343776, 'name': 'Ejirin', 'country': 'NG', 'coord': { 'lng': 3.90019, 'lat': 6.61423 } }
          ],
          req = { params: { lng: coords[0], lat: coords[1] } },
          res = {
            send: function(){ },
            json: function(dta){
              try {
                should.exist(dta);
                dta.should.deep.equal(result);
                cityMock.verify();
                done();
              } catch (e) {
                done(e);
              }
            },
            status: function(responseStatus) {
              responseStatus.should.equal(200);
              return this;
            }
          };
      cityMock.expects('findByCoords').once()
      .withArgs(coords)
      .resolves(result);

      cityCtrl.getByCoords(req, res);
    });
  });

  describe('cityCtrl.getByName Route: /city/:name', function () {
    it('should return data for cities matching name', function (done) {
      var ctname = 'Lagos',
          result = [
            { '_id': 2332453, 'name': 'Lagos State', 'country': 'NG', 'coord': { 'lng': 3.75, 'lat': 6.58333 } },
            { '_id': 8010518, 'name': 'Lagos', 'country': 'PT', 'coord': { 'lng': -8.67661, 'lat': 37.095669 } },
            { '_id': 735497, 'name': 'Lagos', 'country': 'GR', 'coord': { 'lng': 26.466669, 'lat': 41.450001 } }
          ],
          req = { params: { name: ctname } },
          res = {
            send: function(){ },
            json: function(dta){
              try {
                should.exist(dta);
                dta.should.deep.equal(result);
                cityMock.verify();
                done();
              } catch (e) {
                done(e);
              }
            },
            status: function(responseStatus) {
              responseStatus.should.equal(200);
              return this;
            }
          };
      cityMock.expects('findByName').once()
      .withArgs(ctname)
      .resolves(result);

      cityCtrl.getByName(req, res);
    });
  });
});
