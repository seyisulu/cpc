// jshint esversion: 6
module.exports = function (opts) {
  var cityCtrl = {
    getByName: function getByName(req, res) {
      opts.dbo.City.findByName(req.params.name)
      .then((city) => res.status(200).json(city));
    },
    getByCoords: function getByCoords(req, res) {
      opts.dbo.City.findByCoords([req.params.lng, req.params.lat])
      .then((city) => res.status(200).json(city));
    }
  };

  return cityCtrl;
};
