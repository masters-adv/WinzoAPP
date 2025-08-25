const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Workaround for Windows path issue with node:sea
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;

