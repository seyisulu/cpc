// jshint esversion: 6
module.exports = function (opts) {
  var weatherCtrl = {
    getById: function getById(req, res) {
      var cutoff = Date.now() - 60 * 60 * 1000;
      opts.dbo.Weather.getRecentWeather(req.params.id, cutoff)
      .then((weather) => {
        if (weather) return res.status(200).json(weather.data);
        else {
          opts.client.get(
            process.env.OPENWM_URL + '?id=${id}&APPID=${key}',
            { path: { id: req.params.id, key: process.env.OPENWM_KEY } },
            function (data, resp){
              opts.dbo.Weather
              .saveRecentWeather(req.params.id, data)
              .then(function (qryDetails) {
                res.json(data);
              });
          });
        }
      });
    }
  };

  return weatherCtrl;
};
