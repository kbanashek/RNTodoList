module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@components': './src/components',
            '@store': './src/store',
            '@screens': './src/screens',
            '@services': './src/services',
            '@hooks': './src/hooks',
            '@types': './src/types'
          }
        }
      ]
    ]
  };
};
