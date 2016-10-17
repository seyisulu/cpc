module.exports = function (opt) {
  opt.router.get('/', function(req, res, next) {
    res.send('respond with a resource');
  });

  return opt.router;
};
