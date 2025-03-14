// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.resolver = {
    ...resolver,
    extraNodeModules: {
      '@components': `${__dirname}/src/components`,
      '@store': `${__dirname}/src/store`,
      '@screens': `${__dirname}/src/screens`,
      '@services': `${__dirname}/src/services`,
      '@hooks': `${__dirname}/src/hooks`,
      '@types': `${__dirname}/src/types`
    }
  };

  return config;
})();
