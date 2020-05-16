import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/ResizeEmitter.js',
    output: {
      file: 'lib/ResizeEmitter.js',
      format: 'umd',
      name: 'ResizeEmitter',
      // sourcemap: true,
      plugins: [terser()]
    }
  }
];
