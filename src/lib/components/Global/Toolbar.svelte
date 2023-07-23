<script lang="ts">
	import Logo1 from '$lib/assets/icons/Logo1.svelte'
	import IconMenu from '$lib/assets/icons/IconMenu.svelte'
</script>

<div class="navbar">
	<div class="navbar-start">
		<div class="dropdown">
			<label tabindex="0" class="btn btn-ghost lg:hidden">
				<IconMenu />
			</label>
			<ul
				tabindex="0"
				class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
				<li>
					<a class="justify-between focus:bg-pink-700"> Products </a>
					<ul class="p-2">
						<li><a class="focus:bg-pink-700" href="https://mage.stream">Mage</a></li>
					</ul>
				</li>
				<li><a class="focus:bg-pink-700" href="/careers">Careers</a></li>
				<li><a class="focus:bg-pink-700" href="/legal">Legal</a></li>
				<li><a class="focus:bg-pink-700" href="/contact">Contact</a></li>
				<!-- <li><a href="/settings">Settings</a></li> -->
			</ul>
		</div>
		<a class="btn" href="/home">
			<Logo1 />
		</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li tabindex="0">
				<details>
					<summary class="focus:bg-pink-700"> Products </summary>
					<ul class="p-2 z-10">
						<li><a class="focus:bg-pink-700" href="https://mage.stream">Mage</a></li>
					</ul>
				</details>
			</li>
			<li><a class="focus:bg-pink-700" href="/careers">Careers</a></li>
			<li><a class="focus:bg-pink-700" href="/legal">Legal</a></li>
			<li><a class="focus:bg-pink-700" href="/contact">Contact</a></li>
			<!-- <li><a href="/settings">Settings</a></li> -->
		</ul>
	</div>
	<div class="navbar-end" />
</div>
