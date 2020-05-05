const path = require("path");
const webpack = require("webpack");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const bundleOutputDir = './wwwroot/dist';

module.exports = env => {
    const isDevBuild = !(env && env.prod);
    const isAnalyze = (env && env.analyze);

    return [{
        stats: {
            modules: false
        },
        entry: [
            isDevBuild && require.resolve('webpack-dev-server/client') + '?/',
            "./ClientApp/pages/EditSubmission.tsx",
        ].filter(Boolean),
        resolve: {
            extensions: [".js", ".jsx", ".ts", ".tsx"]
        },
        output: {
            path: path.join(__dirname, bundleOutputDir),
            filename: "[name].js",
            publicPath: "/dist"
        },
        mode: isDevBuild ? 'development' : 'production',
        devtool: isDevBuild ? 'eval-source-map': 'source-map',
        devServer: {
            compress: true,
            port: process.env.DEV_SERVER_PORT || 8080,
            injectClient: false,
            // transportMode: 'ws',  // TODO: move to WS once it's no longer experimental
            contentBase: path.resolve(__dirname, 'wwwroot')
        },
        module: {
            rules: [{
                    test: /\.tsx?$/,
                    include: /ClientApp/,
                    use: "awesome-typescript-loader?silent=true"
                },
                {
                    test: /\.css$/,
                    use: [
                        !isDevBuild ?
                        MiniCssExtractPlugin.loader : {
                            loader: 'style-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        !isDevBuild ?
                        MiniCssExtractPlugin.loader : {
                            loader: 'style-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                    ]
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg|woff)$/,
                    use: "url-loader?limit=25000"
                }
            ]
        },
        optimization: {
            minimizer: isDevBuild ? [] : [
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true,
                }),
                new OptimizeCSSAssetsPlugin({}),
            ],
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    default: false,
                    vendor: {
                        name: 'vendor',
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10
                    },
                }
            }
        },
        plugins: [
            new CheckerPlugin(),
            ...isDevBuild ? [
                // Plugins that apply in development builds only
            ] : [
                // Plugins that apply in production builds only
                new MiniCssExtractPlugin({
                    filename: '[name].min.css',
                }),
            ],
            // Webpack Bundle Analyzer
            // https://github.com/th0r/webpack-bundle-analyzer
            ...isAnalyze ? [new BundleAnalyzerPlugin()] : [],
        ],
    }];
};
