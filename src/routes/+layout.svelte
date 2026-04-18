<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { auth } from '$lib/auth.svelte';

	let { children } = $props();

	let mobileMenuOpen = $state(false);

	onMount(() => auth.init());

	const navLinks = [
		{ href: '/', label: 'Beranda' },
		{ href: '/directory', label: 'Direktori' },
		{ href: '/board', label: 'Papan Lowongan' }
	];

	function isActive(href: string) {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<div class="min-h-screen flex flex-col">
	<!-- Navbar -->
	<nav class="sticky top-0 z-50 border-b border-gray-800/60 bg-gray-950/90 backdrop-blur-xl">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="flex items-center justify-between h-16">
				<!-- Logo -->
				<a href="/" class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-sm">FL</div>
					<span class="font-bold text-gray-100 hidden sm:block">FreelancerID</span>
				</a>

				<!-- Desktop nav -->
				<div class="hidden md:flex items-center gap-1">
					{#each navLinks as link}
						<a
							href={link.href}
							class="px-3 py-2 rounded-lg text-sm font-medium transition-colors {isActive(link.href)
								? 'text-brand-400 bg-brand-950/60'
								: 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'}"
						>
							{link.label}
						</a>
					{/each}
				</div>

				<!-- Auth -->
				<div class="flex items-center gap-2">
					{#if !auth.loading}
						{#if auth.userId}
							<a href="/edit-profile" class="btn-ghost text-sm">
								<span class="w-6 h-6 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-white">
									{auth.avatarInitials}
								</span>
								<span class="hidden sm:block text-gray-300">Profil</span>
							</a>
						{:else}
							<a href="/register" class="btn-primary text-sm py-2 px-4">Daftar Sekarang</a>
						{/if}
					{:else}
						<div class="w-24 h-9 rounded-xl bg-gray-800 animate-pulse"></div>
					{/if}

					<!-- Mobile menu button -->
					<button
						class="md:hidden btn-ghost p-2"
						onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
						aria-label="Menu"
					>
						{#if mobileMenuOpen}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
						{:else}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
						{/if}
					</button>
				</div>
			</div>

			<!-- Mobile menu -->
			{#if mobileMenuOpen}
				<div class="md:hidden border-t border-gray-800 py-3 space-y-1">
					{#each navLinks as link}
						<a
							href={link.href}
							onclick={() => (mobileMenuOpen = false)}
							class="block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {isActive(link.href)
								? 'text-brand-400 bg-brand-950/60'
								: 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'}"
						>
							{link.label}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</nav>

	<!-- Main content -->
	<main class="flex-1">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="border-t border-gray-800 py-8 mt-16">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 text-center">
			<div class="flex items-center justify-center gap-2 mb-3">
				<div class="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center font-bold text-white text-xs">FL</div>
				<span class="font-semibold text-gray-300">FreelancerID</span>
			</div>
			<p class="text-sm text-gray-500">Direktori freelancer Indonesia. Privasi terjaga, komunitas terpercaya.</p>
		</div>
	</footer>
</div>
