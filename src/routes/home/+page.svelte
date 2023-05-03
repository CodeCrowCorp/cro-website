<script>
	import IconRightArrow from '$lib/assets/icons/IconRightArrow.svelte'
	import IconRightChenvronSmall from '$lib/assets/icons/IconRightChenvronSmall.svelte'
</script>

<section class="hero min-h-screen">
	<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 relative">
		<a
			href="https://mage.stream"
			class="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-pink-700 bg-pink-100 rounded-full dark:bg-pink-900 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800">
			<span class="text-xs bg-pink-600 rounded-full text-white px-4 py-1.5 mr-3">New</span>
			<span class="text-sm font-medium">Mage is WIP! Check it out here</span>
			<IconRightChenvronSmall />
		</a>
		<h1 class="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
			Building <span
				class="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500"
				>collaborative</span> services.
		</h1>
		<p
			class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-200">
			We push the boundaries of innovation through bleeding-edge technology, open-source
			development, and the integration of AI and Web3.
		</p>

		<div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
			<a
				href="https://github.com/CodeCrowCorp"
				class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-pink-700 hover:bg-pink-800 focus:ring-4 focus:ring-pink-300 dark:focus:ring-pink-900">
				Join our efforts
				<IconRightArrow />
			</a>
		</div>
	</div>
</section>
