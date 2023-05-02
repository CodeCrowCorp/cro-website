<script>
	import IconDownChevron from '$lib/assets/icons/IconDownChevron.svelte'
	import IconRightChevron from '$lib/assets/icons/IconRightChevron.svelte'
</script>

<div class="navbar bg-base-100">
	<div class="navbar-start">
		<div class="dropdown">
			<label tabindex="0" class="btn btn-ghost lg:hidden">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h8m-8 6h16" /></svg>
			</label>
			<ul
				tabindex="0"
				class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
				<li tabindex="0">
					<a class="justify-between">
						Products
						<IconRightChevron />
					</a>
					<ul class="p-2">
						<li><a href="https://mage.stream">Mage</a></li>
						<li><a href="https://infini.build">infinibuild</a></li>
						<li><a href="https://mvp.online">MVP</a></li>
					</ul>
				</li>
				<li><a href="/careers">Careers</a></li>
				<li><a href="/legal">Legal</a></li>
				<li><a href="/contact">Contact Us</a></li>
				<li><a href="/settings">Settings</a></li>
			</ul>
		</div>
		<a class="btn btn-ghost normal-case text-xl" href="/home">Code Crow</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li tabindex="0">
				<a href="/home">
					Products
					<IconDownChevron />
				</a>
				<ul class="p-2 shadow bg-base-100 rounded-box w-52">
					<li><a href="https://mage.stream">Mage</a></li>
					<li><a href="https://infini.build">infinibuild</a></li>
					<li><a href="https://mvp.online">MVP</a></li>
				</ul>
			</li>
			<li><a href="/careers">Careers</a></li>
			<li><a href="/legal">Legal</a></li>
			<li><a href="/contact">Contact Us</a></li>
			<li><a href="/settings">Settings</a></li>
		</ul>
	</div>
	<div class="navbar-end" />
</div>
