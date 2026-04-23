module.exports = function (api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo', { reanimated: false }], 'nativewind/babel'],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],

          alias: {
            '@': './',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],
    ],
  };
};
