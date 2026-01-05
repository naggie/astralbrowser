import App from './App.svelte';
import { mount } from 'svelte';

export default function(target: HTMLElement, props: { mountPoint: string }) {
    return mount(App, { target, props });
}
