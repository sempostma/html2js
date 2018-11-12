const path = require('path');

module.exports = {
    context: __dirname,
    entry: path.resolve(__dirname, 'src/index.js'),
    mode: 'development',
    output: {
        path: path.resolve(__dirname),
        filename: 'html2js.js',
    },
    module: {
        rules: []
    }
}
