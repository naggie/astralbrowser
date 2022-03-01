import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
        "root": "/piracy/nfs/",
    }
});

export default app;
