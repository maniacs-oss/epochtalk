var path = require('path');

module.exports = [
  { plugin: require(path.normalize(__dirname + '/blacklist')), db: true }
];
