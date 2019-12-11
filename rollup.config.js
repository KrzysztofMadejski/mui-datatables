import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/index.ts',
  plugins: [
    resolve({
      extensions: [ '.js', '.jsx', '.ts', '.tsx' ], 
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    typescript(),
    commonjs({
      include: ['node_modules/**'],
    }),
    uglify({
      compress: {
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
      },
      output: {
        comments: false,
      },
    }),
  ],
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    exports: 'named',
  },
  sourcemap: true,
};
