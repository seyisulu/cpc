module.exports = function (opts) {
  var weatherCtrl = require('./weather.ctrl')({ dbo: opts.dbo, client: opts.client, log: opts.log }),
      cityCtrl = require('./city.ctrl')({ dbo: opts.dbo, log: opts.log });
  opts.router.get('/weather/city/:id', weatherCtrl.getById);
  opts.router.get('/city/:name', cityCtrl.getByName);
  opts.router.get('/city/:lng/:lat', cityCtrl.getByCoords);

  return opts.router;
};
