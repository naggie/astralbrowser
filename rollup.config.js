import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';

export default [
    {
        input: 'src/App.svelte',
        output: {
            format: 'umd',
            name: 'AstralBrowser',
            file: 'public/build/astralbrowser.js'
        },
        plugins: [
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
                sourceMap: false,
            }),
            terser(),
        ],
    },
];
