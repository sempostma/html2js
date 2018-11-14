const path = require('path');

module.exports = {
    context: __dirname,
    entry: path.resolve(__dirname, 'src/index.js'),
    mode: 'production',
    output: {
        path: path.resolve(__dirname),
        filename: 'html2js.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['babel-preset-env']
                    }
                }
            }
        ]
    }
}
