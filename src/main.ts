import { mount } from 'svelte';
import App from './App.svelte';

// Svelte 5 components are not classes; export a factory function instead.
export default function(options: { target: Element, props: { mountPoint: string } }) {
    return mount(App, options);
}
