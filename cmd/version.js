const { version } = require('../package.json');
const { name } = require('../package.json');

module.exports = (args) => {
  console.log(`${name} v${version}`);
}