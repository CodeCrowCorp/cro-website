<script lang="ts">
	import { env } from '$env/dynamic/public'
	import IconSocialGitHub from '$lib/assets/icons/social/IconSocialGitHub.svelte'
	import IconSocialDiscord from '$lib/assets/icons/social/IconSocialDiscord.svg'
	import IconSocialTwitter2 from '$lib/assets/icons/social/IconSocialTwitter2.svelte'
	import IconSocialCodeCrow from '$lib/assets/icons/social/IconSocialCodeCrow.svelte'
</script>

<footer class="footer footer-center p-10 bg-neutral text-neutral-content">
	<div class="space-y-1">
		<div class="w-20">
			<IconSocialCodeCrow />
		</div>
		<div>
			<p class="font-bold">Code Crow Corp © {new Date().getFullYear()}</p>
			<p>v{__VERSION__} [{env.PUBLIC_ENV}]</p>
		</div>
	</div>
	<div class="grid grid-flow-col gap-4">
		<a href="https://github.com/CodeCrowCorp" target="_blank" rel="noreferrer">
			<IconSocialGitHub />
		</a>
		<a href="https://discord.mage.stream" target="_blank" rel="noreferrer">
			<img src={IconSocialDiscord} alt="" />
		</a>
		<a href="https://twitter.com/CodeCrowCorp" target="_blank" rel="noreferrer">
			<IconSocialTwitter2 />
		</a>
	</div>
</footer>
