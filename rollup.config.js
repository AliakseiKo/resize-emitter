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
  },
  {
    input: 'src/ScrollResizeEmitter.js',
    output: {
      file: 'test/ScrollResizeEmitter.js',
      format: 'umd',
      name: 'ScrollResizeEmitter'
    }
  },
  {
    input: 'src/IntervalResizeEmitter.js',
    output: {
      file: 'test/IntervalResizeEmitter.js',
      format: 'umd',
      name: 'IntervalResizeEmitter'
    }
  },
  {
    input: 'src/ObserverResizeEmitter.js',
    output: {
      file: 'test/ObserverResizeEmitter.js',
      format: 'umd',
      name: 'ObserverResizeEmitter'
    }
  }
];
