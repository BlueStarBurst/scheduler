const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function createCopy(pathW = '') {
    return ({
        entry: './ext/app.tsx',
        output: {
            path: path.resolve(__dirname, 'build' + pathW),
            filename: 'appBundle.js',
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                },
                {
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    loader: 'ts-loader',
                },
                {
                    test: /\.(scss|css)$/,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(jpg|png|svg|ico|icns|glb)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                    },
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: path.resolve(__dirname, './public/index.html'),
            })
        ]
    })
}

module.exports = [
    createCopy(),
];

// const rendererConfig = lodash.cloneDeep(commonConfig);
// rendererConfig.entry = './client/app.js';
// rendererConfig.target = 'electron-renderer';
// rendererConfig.output.filename = 'renderer.bundle.js';
// rendererConfig.plugins = [
//   new HtmlWebpackPlugin({
//     template: path.resolve(__dirname, './client/index.html'),
//   }),
// ];

//module.exports = [mainConfig, rendererConfig];