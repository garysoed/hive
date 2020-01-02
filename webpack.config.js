const WebpackBuilder = require('dev/webpack/builder');
const glob = require('glob');

const base = (new WebpackBuilder(__dirname))
    .addEntry('test', glob.sync('./src/**/*.test.ts'))
    .addEntry('main', glob.sync('./src/main.ts'))
    .setOutput('[name].js', '/out')
    .addTypeScript()
    .addHtml()
    .setAsNode()
    .buildForDevelopment('Hive');

// Needed because command-line-usage assumes that array-back is commonjs, but array-back ends up
// with ejs in module mode.
base.resolve.mainFields = ['main', 'module'];
module.exports = base;
