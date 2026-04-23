const { withNativeWind } = require("nativewind/metro");
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Exclude Gradle/Xcode build artifacts from Metro — prevents hang when
// gradlew has been run locally and leaves thousands of files in node_modules
const sep = path.sep === "\\" ? "\\\\" : "/";
config.resolver.blockList = [
  new RegExp(`.*${sep}android${sep}build${sep}.*`),
  new RegExp(`.*${sep}android${sep}\\.cxx${sep}.*`),
  new RegExp(`.*${sep}ios${sep}build${sep}.*`),
];

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...config.resolver,
  blockList: config.resolver.blockList,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    buffer: require.resolve("buffer"),
  },
};

config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, { input: "./global.css" });
