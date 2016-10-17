module.exports = function (opt) {
  opt.router.get('/', function(req, res, next) {
    res.render('index', { title: 'Compucorp' });
  });

  return opt.router;
};
