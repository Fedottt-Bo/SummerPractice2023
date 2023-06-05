const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './main.js',
  mode: 'production',
  optimization: {
    chunkIds: 'total-size',
    innerGraph: true,
    concatenateModules: true,
    mangleWasmImports: true,
    mergeDuplicateChunks: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
          compress: {
            passes: 4,
            unsafe_math: true,
          },
          ecma: undefined,
          enclose: false,
          ie8: true,
          keep_classnames: false,
          keep_fnames: false,
          mangle: true,
        },
      }),
    ],
  },
  output:
  {
    filename: '../../resources/005_textured_model.js',
    library: 'bundle',
    path: path.resolve(__dirname),
  },
};
