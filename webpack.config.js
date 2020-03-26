const path = require('path')
const nodeExternals = require('webpack-node-externals')

const ENTRY = path.resolve(__dirname, 'src/index.ts')
const OUT_DIR = path.resolve(__dirname, 'build')

module.exports = {
  entry: ENTRY,
  mode: 'production',
  target: 'node', // default includes some stuff we need like fs
  devtool: 'source-map',
  externals: [nodeExternals()], // ignore all modules in node_modules
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: OUT_DIR,
  },
}
