<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth.svelte';
	import { DISCIPLINES } from '$lib/constants';
	import { api } from '$lib/rpc';

	let type = $state<'JOB' | 'TALENT'>('JOB');
	let title = $state('');
	let description = $state('');
	let field = $state('');
	let image_url = $state('');
	let days = $state(14);
	let loading = $state(false);
	let error = $state('');

	// Auth modal
	let showAuthModal = $state(false);
	let authInput = $state('');
	let authError = $state('');
	let authLoading = $state(false);

	async function submitAuth() {
		authError = '';
		authLoading = true;
		try {
			const valid = await api.verifyUser(authInput.trim());
			if (valid) { auth.login(authInput.trim()); showAuthModal = false; }
			else authError = 'ID tidak ditemukan';
		} catch { authError = 'Terjadi kesalahan'; }
		finally { authLoading = false; }
	}

	async function submit() {
		if (!auth.userId) { showAuthModal = true; return; }
		if (!title.trim()) { error = 'Judul wajib diisi'; return; }
		if (!description.trim()) { error = 'Deskripsi wajib diisi'; return; }
		if (title.length < 5) { error = 'Judul terlalu pendek (min 5 karakter)'; return; }

		error = '';
		loading = true;
		try {
			const res = await api.createOpportunity({
				user_id: auth.userId,
				type,
				title: title.trim(),
				description: description.trim(),
				field: field || undefined,
				image_url: image_url.trim() || undefined,
				days
			});
			goto(`/board/${res.id}`);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Terjadi kesalahan';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Buat Postingan — FreelancerID</title>
</svelte:head>

{#if showAuthModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true">
		<div class="card p-6 w-full max-w-sm">
			<h2 class="text-lg font-bold text-white mb-1">Masuk Dulu</h2>
			<p class="text-sm text-gray-400 mb-5">Kamu perlu login untuk membuat postingan</p>
			{#if authError}
				<div class="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-sm">{authError}</div>
			{/if}
			<input class="input mb-3 font-mono text-center text-lg tracking-widest uppercase" maxlength="10" placeholder="ID Aksesmu" bind:value={authInput} onkeydown={(e) => e.key === 'Enter' && submitAuth()} />
			<div class="flex gap-2">
				<button class="btn-secondary flex-1 justify-center" onclick={() => (showAuthModal = false)}>Batal</button>
				<button class="btn-primary flex-1 justify-center" onclick={submitAuth} disabled={authLoading}>
					{authLoading ? 'Memeriksa...' : 'Masuk'}
				</button>
			</div>
			<p class="text-center text-xs text-gray-500 mt-4">Belum punya ID? <a href="/register" class="text-brand-400 hover:underline">Daftar</a></p>
		</div>
	</div>
{/if}

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-10">
	<div class="mb-8">
		<a href="/board" class="btn-ghost text-sm mb-4 -ml-2">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
			Kembali
		</a>
		<h1 class="text-2xl font-bold text-white">Buat Postingan</h1>
		<p class="text-gray-400 text-sm mt-1">Maksimal 3 postingan aktif per pengguna</p>
	</div>

	<div class="card p-6 sm:p-8 space-y-6">
		{#if error}
			<div class="p-3 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-sm">{error}</div>
		{/if}

		<!-- Type -->
		<div>
			<fieldset>
		<legend class="label">Tipe Postingan</legend>
			<div class="flex bg-gray-800 rounded-xl p-1 gap-1">
				<button
					class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all {type === 'JOB' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-gray-200'}"
					onclick={() => (type = 'JOB')}
				>Butuh Freelancer</button>
				<button
					class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all {type === 'TALENT' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-gray-200'}"
					onclick={() => (type = 'TALENT')}
				>Tawarkan Jasa</button>
			</div>
		</fieldset>
		</div>

		<!-- Title -->
		<div>
			<label class="label" for="title">Judul <span class="text-red-400">*</span></label>
			<input id="title" class="input" type="text" bind:value={title} placeholder={type === 'JOB' ? 'e.g. Butuh Web Developer React.js' : 'e.g. Desainer Logo & Brand Identity'} maxlength="150" />
			<p class="text-xs text-gray-500 mt-1">{title.length}/150</p>
		</div>

		<!-- Description -->
		<div>
			<label class="label" for="desc">Deskripsi <span class="text-red-400">*</span></label>
			<textarea id="desc" class="textarea" rows="6" bind:value={description} placeholder={type === 'JOB' ? 'Jelaskan kebutuhan proyek, budget, timeline, dll...' : 'Jelaskan layanan, keahlian, harga, dan cara menghubungimu...'} maxlength="3000"></textarea>
			<p class="text-xs text-gray-500 mt-1">{description.length}/3000</p>
		</div>

		<!-- Field -->
		<div>
			<label class="label" for="field">Kategori Keahlian <span class="text-gray-500 text-xs">(opsional)</span></label>
			<select id="field" class="select" bind:value={field}>
				<option value="">-- Pilih Kategori --</option>
				{#each DISCIPLINES as d}
					<option value={d}>{d}</option>
				{/each}
			</select>
		</div>

		<!-- Image URL -->
		<div>
			<label class="label" for="img">URL Gambar <span class="text-gray-500 text-xs">(opsional)</span></label>
			<input id="img" class="input" type="url" bind:value={image_url} placeholder="https://i.ibb.co/example.jpg" />
			<p class="text-xs text-gray-500 mt-1">Upload ke ImgBB atau layanan serupa, lalu paste URL-nya</p>
		</div>

		<!-- Days -->
		<div>
			<label class="label" for="days-range">Durasi Tayang: <span class="text-brand-400">{days} hari</span></label>
			<input id="days-range" type="range" min="1" max="14" bind:value={days} class="w-full accent-brand-500" />
			<div class="flex justify-between text-xs text-gray-600 mt-1">
				<span>1 hari</span>
				<span>14 hari</span>
			</div>
		</div>

		<button class="btn-primary w-full justify-center py-3" onclick={submit} disabled={loading}>
			{#if loading}
				<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
				Memposting...
			{:else}
				Buat Postingan
			{/if}
		</button>
	</div>
</div>
