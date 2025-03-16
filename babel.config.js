module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv'],
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@types': './src/types',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@hooks': './src/hooks',
            '@env': './src/env.d.ts'
          }
        }
      ],
      ['@babel/plugin-transform-private-methods', { loose: true }]
    ],
    env: {
      test: {
        plugins: ['@babel/plugin-transform-runtime']
      }
    }
  };
};
