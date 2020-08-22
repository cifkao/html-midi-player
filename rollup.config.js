import sass from 'rollup-plugin-sass';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import url from '@rollup/plugin-url';

import pkg from './package.json';

const umdOptions = {
  format: 'umd',
  name: 'midiPlayer',
  globals: {
    '@magenta/music/es6/core': 'core'
  }
};

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
    },
    {
      file: 'dist/midi-player.min.js',
      ...umdOptions,
      plugins: [terser()]
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
