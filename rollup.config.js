// TODO revert to original and make dev/prod work as expected
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

export default [
    {
        input: 'src/App.svelte',
        output: {
            format: 'umd',
            name: 'AstralBrowser',
            file: 'public/build/astralbrowser.js',
            sourcemap: true,
        },
        plugins: [
            webWorkerLoader({
                sourcemap: true,
                extensions: ['.ts', '.js'],
            }),
            svelte({
                preprocess: sveltePreprocess(),
            }),
            // we'll extract any component CSS out into
            // a separate file - better for performance
            css({ output: 'astralbrowser.css' }),

            resolve({
                browser: true,
                dedupe: ['svelte']
            }),
            commonjs(),
            typescript({
                sourceMap: true,
            }),
            //terser(),
        ],
    },
];
