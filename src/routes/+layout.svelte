<script lang="ts">
	import '$lib/assets/styles/tailwind-output.css'
	import Toolbar from '$lib/components/Global/Toolbar.svelte'

	// @ts-ignore
	import NProgress from 'nprogress'
	import { navigating } from '$app/stores'

	// NProgress Loading bar
	import '$lib/assets/styles/nprogress.css'
	import Footer from '$lib/components/Global/Footer.svelte'

	NProgress.configure({
		minimum: 0.75,
		showSpinner: false,
		speed: 5,
		trickleSpeed: 200
	})
	$: {
		if ($navigating) {
			NProgress.start()
		} else {
			NProgress.done()
		}
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="/fonts/montserrat.css" />
	{@html `<script> 
          const theme = localStorage.getItem('theme') || 'synthwave';
          document.querySelector('html').dataset.theme = theme;
        </script>`}
</svelte:head>

<div
	class="w-full h-full absolute top-0 left-0 bg-white dark:bg-gray-900 bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern.svg')] dark:bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern-dark.svg')]" />
<div
	class="w-full h-full absolute top-0 left-0 bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-900" />

<div class="relative h-screen overflow-auto block">
	<Toolbar />
	<slot />
	<Footer />
</div>
