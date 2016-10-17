var log       = require('../../app/log'),
    chai      = require('chai'),
    sinon     = require('sinon'),
    mongoose  = require('mongoose');
    require('sinon-mongoose');
    require('sinon-as-promised');
    require('dotenv').config();

chai.should();
chai.use(require('sinon-chai'));

describe('Database Object (dbo)', function () {
  var logMock, mongooseConnStub,
      dbURL = process.env.DB_URL,
      dbOpt = { db: { safe: { w: 1, journal: true, wtimeout: 10000 } }, config: { autoIndex: true } };

  before(function () {
    mongooseConnStub = sinon.stub(mongoose, 'connect');
    dbo = require('../../app/dbo')({ mongoose: mongoose, log: logMock });
  });

  beforeEach(function () {
    logMock = sinon.mock(log);
  });

  afterEach(function () {
    logMock.restore();
  });

  after(function () {
    mongooseConnStub.restore();
  });

  it('should connect to MongoDB', function () {
    mongooseConnStub.should.have.been.calledWith(dbURL, dbOpt);
  });

  it('should have the City and Weather properties', function () {
    dbo.should.have.property('City');
    dbo.should.have.property('Weather');
  });
});
