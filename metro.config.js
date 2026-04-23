const { withNativeWind } = require("nativewind/metro");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    buffer: require.resolve("buffer"),
  },
};

config.resolver.unstable_enablePackageExports = true;

// Apply NativeWind FIRST, then blockList so it cannot be overwritten
const finalConfig = withNativeWind(config, { input: "./global.css" });

// Exclude Gradle/Xcode build artifacts — prevents Metro hang when gradlew
// has been run locally and left thousands of .class/.so files in node_modules.
// Use [/\\] to match both forward and back slashes since Metro normalizes
// paths to forward slashes on all platforms including Windows.
finalConfig.resolver.blockList = [
  /.*[/\\]android[/\\]build[/\\].*/,
  /.*[/\\]android[/\\]\.cxx[/\\].*/,
  /.*[/\\]app[/\\]\.cxx[/\\].*/,
  /.*[/\\]ios[/\\]build[/\\].*/,
];

module.exports = finalConfig;
