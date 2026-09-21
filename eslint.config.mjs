import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            { sourceTag: 'scope:app', onlyDependOnLibsWithTags: ['*'] },
            {
              sourceTag: 'scope:tokens',
              onlyDependOnLibsWithTags: ['scope:tokens'],
            },
            {
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:tokens'],
            },
            {
              sourceTag: 'scope:ui',
              onlyDependOnLibsWithTags: [
                'scope:ui',
                'scope:core',
                'scope:tokens',
              ],
            },
            {
              sourceTag: 'scope:forms',
              onlyDependOnLibsWithTags: [
                'scope:forms',
                'scope:core',
                'scope:tokens',
              ],
            },
            {
              sourceTag: 'scope:restaurant',
              onlyDependOnLibsWithTags: [
                'scope:restaurant',
                'scope:ui',
                'scope:forms',
                'scope:layout',
                'scope:core',
                'scope:tokens',
              ],
            },
            {
              sourceTag: 'scope:layout',
              onlyDependOnLibsWithTags: [
                'scope:layout',
                'scope:core',
                'scope:tokens',
              ],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
