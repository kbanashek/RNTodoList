const upstreamTransformer = require('metro-react-native-babel-transformer');

module.exports.transform = async ({src, filename, options}) => {
  if (filename.endsWith('node_modules/expo-modules-core/src/index.ts')) {
    // Skip type stripping for this file
    return {
      code: src,
      map: null,
    };
  }
  return upstreamTransformer.transform({src, filename, options});
};
