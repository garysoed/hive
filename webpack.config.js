const WebpackBuilder = require('dev/webpack/builder');
const glob = require('glob');

module.exports = (new WebpackBuilder(__dirname))
    .addEntry('test', glob.sync('./src/**/*.test.ts'))
    .addEntry('main', glob.sync('./src/main.ts'))
    .addEntry('gapi', glob.sync('./src/contentparser/parse-google-spreadsheet.ts'))
    .setOutput('[name].js', '/out')
    .addTypeScript()
    .addHtml()
    .setAsNode()
    .buildForDevelopment('Hive');
