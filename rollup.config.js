import sass from 'rollup-plugin-sass';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import url from '@rollup/plugin-url';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';

import pkg from './package.json';

const umdOptions = {
  format: 'esm',
  name: 'midiPlayer',
  globals: {
    '@magenta/music/es6/core': 'core'
  }
};
const umdPlugins = [
  getBabelOutputPlugin({
    presets: [
      [
        '@babel/preset-env', {
          targets: 'supports audio-api and supports custom-elementsv1 and supports shadowdomv1 and supports async-functions'
        }
      ],
    ],
    plugins: ['@babel/plugin-transform-modules-umd'],
  })
];

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.module,
      format: 'es'
    },
    {
      file: 'dist/midi-player.js',
      ...umdOptions,
      plugins: umdPlugins,
    },
    {
      file: 'dist/midi-player.min.js',
      ...umdOptions,
      plugins: [...umdPlugins, terser()]
    },
  ],
  plugins: [
    typescript(),
    sass(),
    url({
      include: ['src/assets/**/*.svg']
    }),
  ],
  external: [
    '@magenta/music/es6/core'
  ]
}
