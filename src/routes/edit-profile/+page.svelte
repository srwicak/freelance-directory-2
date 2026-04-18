<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth.svelte';
	import { DISCIPLINES, LOCATIONS } from '$lib/constants';
	import { api } from '$lib/rpc';

	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state(false);
	let notLoggedIn = $state(false);

	let name = $state('');
	let linkedin = $state('');
	let province = $state('');
	let city = $state('');
	let field = $state('');
	let sub_field = $state('');
	let details = $state('');
	let portfolio = $state('');

	const provinces = Object.keys(LOCATIONS);
	let cities = $derived(province ? LOCATIONS[province] ?? [] : []);

	function onProvinceChange() { city = ''; }

	onMount(async () => {
		if (!auth.userId) { notLoggedIn = true; loading = false; return; }
		try {
			const user = await api.getUserById(auth.userId);
			if (!user) { notLoggedIn = true; return; }
			name = user.name;
			linkedin = user.linkedin;
			province = user.province;
			city = user.city;
			field = user.field;
			sub_field = user.sub_field ?? '';
			details = user.details ?? '';
			portfolio = user.portfolio ?? '';
		} catch {
			error = 'Gagal memuat profil';
		} finally {
			loading = false;
		}
	});

	async function submit() {
		if (!auth.userId) return;
		if (!name.trim() || !linkedin.trim()) { error = 'Nama dan LinkedIn wajib diisi'; return; }
		if (!province || !city || !field) { error = 'Lokasi dan bidang keahlian wajib diisi'; return; }
		error = '';
		saving = true;
		try {
			await api.updateUser(auth.userId, { name, linkedin, province, city, field, sub_field, details, portfolio });
			success = true;
			setTimeout(() => (success = false), 3000);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Gagal menyimpan';
		} finally {
			saving = false;
		}
	}

	function doLogout() {
		auth.logout();
		goto('/');
	}
</script>

<svelte:head>
	<title>Edit Profil — FreelancerID</title>
</svelte:head>

<div class="max-w-xl mx-auto px-4 sm:px-6 py-10">
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-white">Edit Profil</h1>
		{#if auth.userId}
			<p class="text-sm text-gray-500 mt-1">ID: <span class="font-mono text-brand-400">{auth.userId}</span></p>
		{/if}
	</div>

	{#if loading}
		<div class="card p-8 animate-pulse space-y-4">
			{#each Array(5) as _}
				<div class="h-12 bg-gray-800 rounded-xl"></div>
			{/each}
		</div>
	{:else if notLoggedIn}
		<div class="card p-8 text-center">
			<p class="text-gray-400 mb-4">Kamu belum login. Masukkan ID aksesmu untuk mengedit profil.</p>
			<a href="/register" class="btn-primary">Daftar atau Masuk</a>
		</div>
	{:else}
		{#if error}
			<div class="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-sm">{error}</div>
		{/if}
		{#if success}
			<div class="mb-4 p-3 rounded-xl bg-green-900/40 border border-green-700/50 text-green-300 text-sm flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
				Profil berhasil diperbarui!
			</div>
		{/if}

		<div class="card p-6 sm:p-8 space-y-6">
			<div>
				<label class="label" for="name">Nama Lengkap <span class="text-red-400">*</span></label>
				<input id="name" class="input" type="text" bind:value={name} maxlength="100" />
			</div>
			<div>
				<label class="label" for="linkedin">LinkedIn URL <span class="text-red-400">*</span></label>
				<input id="linkedin" class="input" type="url" bind:value={linkedin} />
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="label" for="province">Provinsi <span class="text-red-400">*</span></label>
					<select id="province" class="select" bind:value={province} onchange={onProvinceChange}>
						{#each provinces as p}
							<option value={p}>{p}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="label" for="city">Kota <span class="text-red-400">*</span></label>
					<select id="city" class="select" bind:value={city}>
						{#each cities as c}
							<option value={c}>{c}</option>
						{/each}
					</select>
				</div>
			</div>
			<div>
				<label class="label" for="field">Bidang Keahlian <span class="text-red-400">*</span></label>
				<select id="field" class="select" bind:value={field}>
					{#each DISCIPLINES as d}
						<option value={d}>{d}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="label" for="sub_field">Sub-spesialisasi</label>
				<input id="sub_field" class="input" type="text" bind:value={sub_field} maxlength="100" />
			</div>
			<div>
				<label class="label" for="details">Bio / Keahlian</label>
				<textarea id="details" class="textarea" rows="4" bind:value={details} maxlength="1000"></textarea>
				<p class="text-xs text-gray-500 mt-1">{details.length}/1000</p>
			</div>
			<div>
				<label class="label" for="portfolio">Portfolio URL</label>
				<input id="portfolio" class="input" type="url" bind:value={portfolio} />
			</div>

			<div class="flex gap-3 pt-2">
				<button class="btn-primary flex-1 justify-center py-3" onclick={submit} disabled={saving}>
					{saving ? 'Menyimpan...' : 'Simpan Perubahan'}
				</button>
			</div>
		</div>

		<!-- Danger zone -->
		<div class="mt-6 card p-5 border-red-900/40">
			<h3 class="text-sm font-semibold text-gray-400 mb-3">Zona Bahaya</h3>
			<button
				class="btn-ghost text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20"
				onclick={doLogout}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
				Keluar dari perangkat ini
			</button>
		</div>
	{/if}
</div>
