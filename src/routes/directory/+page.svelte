<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/auth.svelte';
	import { DISCIPLINES } from '$lib/constants';
	import { api } from '$lib/rpc';

	type Freelancer = {
		id: string; name: string; field: string; sub_field: string | null;
		province: string; city: string; details: string | null;
		portfolio: string | null; linkedin: string; created_at: number;
	};

	let items = $state<Freelancer[]>([]);
	let loading = $state(true);
	let loadingMore = $state(false);
	let hasMore = $state(false);
	let page = $state(1);
	let search = $state('');
	let fieldFilter = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	// Auth modal
	let showAuthModal = $state(false);
	let authInput = $state('');
	let authError = $state('');
	let authLoading = $state(false);

	// Expanded card
	let expandedId = $state<string | null>(null);

	async function load(reset = false) {
		if (reset) { page = 1; items = []; loading = true; }
		try {
			const res = await api.getFreelancers({ page, limit: 20, search, fieldFilter });
			if (reset) items = res.items;
			else items = [...items, ...res.items];
			hasMore = res.hasMore;
		} finally {
			loading = false;
			loadingMore = false;
		}
	}

	onMount(() => load(true));

	function onSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => load(true), 300);
	}

	async function loadMore() {
		loadingMore = true;
		page++;
		await load();
	}

	async function submitAuth() {
		authError = '';
		authLoading = true;
		try {
			const valid = await api.verifyUser(authInput.trim());
			if (valid) { auth.login(authInput.trim()); showAuthModal = false; authInput = ''; }
			else authError = 'ID tidak ditemukan. Pastikan ID yang kamu masukkan benar.';
		} catch { authError = 'Terjadi kesalahan. Coba lagi.'; }
		finally { authLoading = false; }
	}

	function timeSince(ts: number) {
		const diff = Date.now() / 1000 - ts;
		if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
		if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
		return `${Math.floor(diff / 86400)} hari lalu`;
	}

	function initials(name: string) {
		return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
	}

	const avatarColors = ['bg-brand-700', 'bg-purple-700', 'bg-blue-700', 'bg-emerald-700', 'bg-orange-700', 'bg-rose-700'];
	function avatarColor(id: string) {
		let h = 0;
		for (const c of id) h = (h * 31 + c.charCodeAt(0)) % avatarColors.length;
		return avatarColors[h];
	}
</script>

<svelte:head>
	<title>Direktori Freelancer — FreelancerID</title>
</svelte:head>

<!-- Auth modal -->
{#if showAuthModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true">
		<div class="card p-6 w-full max-w-sm">
			<h2 class="text-lg font-bold text-white mb-1">Masuk dengan ID</h2>
			<p class="text-sm text-gray-400 mb-5">Masukkan ID 10 karakter yang kamu dapat saat daftar</p>
			{#if authError}
				<div class="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-sm">{authError}</div>
			{/if}
			<input class="input mb-3 font-mono text-center text-lg tracking-widest uppercase" maxlength="10" placeholder="XXXXXXXXXX" bind:value={authInput} onkeydown={(e) => e.key === 'Enter' && submitAuth()} />
			<div class="flex gap-2">
				<button class="btn-secondary flex-1 justify-center" onclick={() => (showAuthModal = false)}>Batal</button>
				<button class="btn-primary flex-1 justify-center" onclick={submitAuth} disabled={authLoading || authInput.length < 3}>
					{authLoading ? 'Memeriksa...' : 'Masuk'}
				</button>
			</div>
			<p class="text-center text-xs text-gray-500 mt-4">Belum punya ID? <a href="/register" class="text-brand-400 hover:underline">Daftar gratis</a></p>
		</div>
	</div>
{/if}

<div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-white mb-2">Direktori Freelancer</h1>
		<p class="text-gray-400">Temukan freelancer profesional dari seluruh Indonesia</p>
	</div>

	<!-- Search & filter -->
	<div class="flex flex-col sm:flex-row gap-3 mb-8">
		<div class="relative flex-1">
			<svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
			<input
				class="input pl-10"
				type="text"
				placeholder="Cari nama, keahlian, atau lokasi..."
				bind:value={search}
				oninput={onSearch}
			/>
		</div>
		<select class="select sm:w-56" bind:value={fieldFilter} onchange={() => load(true)}>
			<option value="">Semua Bidang</option>
			{#each DISCIPLINES as d}
				<option value={d}>{d}</option>
			{/each}
		</select>
	</div>

	<!-- Not logged in notice -->
	{#if !auth.userId}
		<div class="mb-6 p-4 rounded-xl bg-brand-900/30 border border-brand-700/40 flex flex-col sm:flex-row items-start sm:items-center gap-3">
			<svg class="w-5 h-5 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
			<p class="text-sm text-brand-300 flex-1">Detail kontak (LinkedIn, portfolio) hanya terlihat oleh anggota terdaftar.</p>
			<div class="flex gap-2">
				<button class="btn-primary text-xs py-1.5 px-3" onclick={() => (showAuthModal = true)}>Masuk</button>
				<a href="/register" class="btn-secondary text-xs py-1.5 px-3">Daftar</a>
			</div>
		</div>
	{/if}

	<!-- Grid -->
	{#if loading}
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each Array(6) as _}
				<div class="card p-5 animate-pulse">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-11 h-11 rounded-full bg-gray-800"></div>
						<div class="flex-1 space-y-2">
							<div class="h-4 bg-gray-800 rounded w-3/4"></div>
							<div class="h-3 bg-gray-800 rounded w-1/2"></div>
						</div>
					</div>
					<div class="space-y-2">
						<div class="h-3 bg-gray-800 rounded"></div>
						<div class="h-3 bg-gray-800 rounded w-4/5"></div>
					</div>
				</div>
			{/each}
		</div>
	{:else if items.length === 0}
		<div class="text-center py-20">
			<svg class="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
			<p class="text-gray-500">Tidak ada freelancer ditemukan</p>
			{#if search || fieldFilter}
				<button class="text-brand-400 text-sm mt-2 hover:underline" onclick={() => { search = ''; fieldFilter = ''; load(true); }}>Reset filter</button>
			{/if}
		</div>
	{:else}
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each items as f}
				{@const isExpanded = expandedId === f.id}
				{@const color = avatarColor(f.id)}
				<div class="card p-5 hover:border-gray-700 transition-all flex flex-col">
					<!-- Header -->
					<div class="flex items-start gap-3 mb-4">
						<div class="w-11 h-11 rounded-full {color} flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
							{initials(f.name)}
						</div>
						<div class="flex-1 min-w-0">
							<h3 class="font-semibold text-gray-100 truncate">{f.name}</h3>
							<p class="text-xs text-gray-500 truncate">{f.city}, {f.province}</p>
						</div>
					</div>

					<!-- Badges -->
					<div class="flex flex-wrap gap-1.5 mb-3">
						<span class="badge-purple">{f.field}</span>
						{#if f.sub_field}
							<span class="badge bg-gray-800 text-gray-400 border border-gray-700">{f.sub_field}</span>
						{/if}
					</div>

					<!-- Details (locked or unlocked) -->
					{#if auth.userId}
						{#if f.details}
							<p class="text-sm text-gray-400 line-clamp-3 mb-3 flex-1">{f.details}</p>
						{/if}

						<!-- Contact links -->
						<div class="flex gap-2 mt-auto pt-3 border-t border-gray-800">
							<a
								href={f.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								class="btn-ghost text-xs py-1.5 px-3 text-brand-400 hover:text-brand-300"
							>
								<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
								LinkedIn
							</a>
							{#if f.portfolio}
								<a href={f.portfolio} target="_blank" rel="noopener noreferrer" class="btn-ghost text-xs py-1.5 px-3">
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
									Portfolio
								</a>
							{/if}
						</div>
					{:else}
						<!-- Blurred / locked -->
						<div class="relative flex-1 mb-3">
							<p class="text-sm text-gray-400 line-clamp-2 blur-sm select-none">{f.details || 'Detail freelancer tersembunyi untuk anggota non-terdaftar'}</p>
							<div class="absolute inset-0 flex items-center justify-center">
								<button
									class="btn-primary text-xs py-1.5 px-3"
									onclick={() => (showAuthModal = true)}
								>
									<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
									Buka Kontak
								</button>
							</div>
						</div>
						<div class="pt-3 border-t border-gray-800">
							<p class="text-xs text-gray-600 text-center">Masuk untuk melihat LinkedIn & portfolio</p>
						</div>
					{/if}

					<p class="text-xs text-gray-600 mt-2">{timeSince(f.created_at)}</p>
				</div>
			{/each}
		</div>

		<!-- Load more -->
		{#if hasMore}
			<div class="text-center mt-8">
				<button class="btn-secondary" onclick={loadMore} disabled={loadingMore}>
					{#if loadingMore}
						<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
						Memuat...
					{:else}
						Muat Lebih Banyak
					{/if}
				</button>
			</div>
		{/if}
	{/if}
</div>
