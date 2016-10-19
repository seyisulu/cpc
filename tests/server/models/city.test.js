var log       = require('../../../app/log'),
    chai      = require('chai'),
    sinon     = require('sinon'),
    mongoose  = require('mongoose');
    require('sinon-mongoose');
    require('sinon-as-promised');
    require('dotenv').config();

chai.should();
chai.use(require('sinon-chai'));

describe('City Mongoose Model (city)', function () {
  var logMock, mongooseConnStub, city, cityMock,
      dbURL = process.env.DB_URL,
      dbOpt = { db: { safe: { w: 1, journal: true, wtimeout: 10000 } }, config: { autoIndex: true } };

  before(function () {
    mongooseConnStub = sinon.stub(mongoose, 'connect');
    dbo = require('../../../app/dbo')({ mongoose: mongoose, log: logMock });
    city = dbo.City;
  });

  beforeEach(function () {
    logMock = sinon.mock(log);
    cityMock = sinon.mock(city);
  });

  afterEach(function () {
    logMock.restore();
    cityMock.restore();
  });

  after(function () {
    mongooseConnStub.restore();
  });

  it('#findByName should query MongoDB with proper options', function (done) {
    cityMock
      .expects('find').withArgs({ name: { '$regex': 'Lagos', '$options': 'i' } })
      .chain('limit', 10)
      .chain('sort', 'name country')
      .chain('exec')
      .resolves('RESULT');

    city.findByName('Lagos').then(function (cities) {
      cityMock.verify();
      cities.should.equal('RESULT');
      done();
    });
  });

  it('#findByCoords should find cities by coordinates', function (done) {//"lon":3.75,"lat":6.58333
    cityMock
      .expects('find').withArgs({ coord: { $near: { $geometry: { type: 'Point', coordinates: [3.75, 6.58333] }, $maxDistance: 5000 } } })
      .chain('limit', 20)
      .chain('sort', 'name')
      .chain('exec')
      .resolves('RESULT');

    city.findByCoords([3.75, 6.58333]).then(function (cities) {
      cityMock.verify();
      cities.should.equal('RESULT');
      done();
    });
  });
});
