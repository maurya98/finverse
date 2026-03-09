const react = require('@vitejs/plugin-react-swc').default;
const path = require('path');
const { defineConfig } = require('vite');
const dts = require('vite-plugin-dts').default;
const wasm = require('vite-plugin-wasm').default;
const packageJson = require('./package.json');

/** @type {import('vite').UserConfig} */
module.exports = defineConfig({
  plugins: [react(), wasm(), dts({ insertTypesEntry: true, rollupTypes: true })],
  resolve: {
    dedupe: ['@lezer/common', '@lezer/lr', '@lezer/highlight'],
    alias: {
      '@gorules/zen-engine-wasm': '@finverse/zen-engine-wasm',
      '@gorules/lezer-zen': '@finverse/lezer-zen',
      '@gorules/lezer-zen-template': '@finverse/lezer-zen-template',
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src', 'index.ts'),
        schema: path.resolve(__dirname, 'src', 'helpers', 'schema.ts'),
      },
      name: 'JDM Editor',
      formats: ['es'],
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['react/jsx-runtime', 'react', 'react-dom', ...Object.keys(packageJson.dependencies)],
      output: {
        globals: {
          'react-dom': 'ReactDOM',
          react: 'React',
        },
      },
    },
  },
});
