import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'iife', // Immediately Invoked Function Expression for browser
    sourcemap: true,
  },
  plugins: [
    resolve(), // resolves third-party modules in node_modules
    commonjs(), // converts CommonJS modules to ES6
    terser(),   // minifies the output
    copy({
      targets: [
        { src: 'src/index.html', dest: 'dist' }
      ]
    })
  ]
};
