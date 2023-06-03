const path = require('path');

module.exports = {
  entry: './main.js',
  mode: 'production',
  optimization: {
    chunkIds: 'total-size',
    
  },
  output:
  {
    filename: './bundle.js',
    library: 'bundle',
    path: path.resolve(__dirname),
  },
};
