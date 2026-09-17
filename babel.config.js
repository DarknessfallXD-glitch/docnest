module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router',
      'react-native-reanimated/plugin',
      'nativewind/babel',
    ],
  };
};