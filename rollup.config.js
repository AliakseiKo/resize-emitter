import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/ResizeEmitter.js',
    output: [
      {
        file: 'lib/ResizeEmitter.js',
        format: 'umd',
        name: 'ResizeEmitter'
      },
      {
        file: 'lib/ResizeEmitter.min.js',
        format: 'umd',
        name: 'ResizeEmitter',
        plugins: [terser()]
      }
    ]
  }
];
