module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        modules: 'commonjs', // Important for Jest
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic', // Use the new JSX transform
      },
    ],
    '@babel/preset-typescript',
  ],

  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
            modules: 'commonjs',
          },
        ],
        [
          '@babel/preset-react',
          {
            runtime: 'automatic',
          },
        ],
        '@babel/preset-typescript',
      ],

    },
  },
}; 