/*jshint esversion: 6 */

module.exports = function(opts) {
  return {
    error: function() {
      console.log(opts.chalk.red('>:<', opts.chalk.bold(...arguments)));
    },
    info: function() {
      console.log(opts.chalk.green('>:<', opts.chalk.bold(...arguments)));
    },
    log: function() {
      console.log(opts.chalk.yellow('>:<', opts.chalk.bold(...arguments)));
    }
  };
};
