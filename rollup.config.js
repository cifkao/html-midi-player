import sass from 'rollup-plugin-sass';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import { string } from 'rollup-plugin-string';
import babel from '@rollup/plugin-babel';

import pkg from './package.json';

const banner =
`/**
 * ${pkg.name}@${pkg.version}
 * ${pkg.repository.url}
 * @author ${pkg.author} (@cifkao)
 * @license ${pkg.license}
 */
`;

const commonPlugins = [
  sass(),
  string({
    include: ['src/assets/**/*.svg']
  }),
];

const umdOutOptions = {
  format: 'umd',
  name: 'midiPlayer',
  globals: {
    '@magenta/music/esm/core.js': 'core'
  },
  banner: banner
};

export default [
  {
    input: 'src/index.ts',
    output: {
      file: pkg.module,
      format: 'es',
      banner: banner,
    },
    plugins: [
      typescript({
        target: 'es2017'
      }),
      ...commonPlugins
    ],
    external: [
      '@magenta/music/esm/core.js',
      'tslib'
    ]
  },

  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/midi-player.js',
        ...umdOutOptions,
      },
      {
        file: 'dist/midi-player.min.js',
        sourcemap: true,
        ...umdOutOptions,
        plugins: [
          terser()
        ]
      },
    ],
    plugins: [
      typescript({
        target: 'esnext'
      }),
      babel({
        extensions: ['.ts', '.js'],
        presets: [
          [
            '@babel/preset-env', {
              targets: 'supports audio-api and supports custom-elementsv1 and supports shadowdomv1'
            }
          ],
        ],
        babelHelpers: 'bundled'
      }),
      ...commonPlugins
    ],
    external: [
      '@magenta/music/esm/core.js'
    ]
  }
]
