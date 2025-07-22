import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';

const external = [
  '@esengine/nova-ecs',
  '@esengine/nova-ecs-math'
];

export default [
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/nova-ecs-render-core.esm.js',
      format: 'es',
      sourcemap: true
    },
    external,
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      })
    ]
  },
  
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/nova-ecs-render-core.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    external,
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      })
    ]
  },
  
  // UMD build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/nova-ecs-render-core.umd.js',
      format: 'umd',
      name: 'NovaECSRenderCore',
      sourcemap: true,
      globals: {
        '@esengine/nova-ecs': 'NovaECS',
        '@esengine/nova-ecs-math': 'NovaECSMath'
      }
    },
    external,
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      })
    ]
  },
  
  // Type definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/nova-ecs-render-core.d.ts',
      format: 'es'
    },
    external,
    plugins: [dts()]
  }
];
