<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth.svelte';
	import { DISCIPLINES, LOCATIONS } from '$lib/constants';
	import { api } from '$lib/rpc';

	// Redirect jika sudah login
	$effect(() => {
		if (!auth.loading && auth.userId) goto('/edit-profile');
	});

	let step = $state(1);
	let loading = $state(false);
	let error = $state('');
	let successId = $state('');
	let copied = $state(false);

	// Form fields
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

	$effect(() => {
		if (province) city = '';
	});

	function validateStep(s: number) {
		if (s === 1) {
			if (!name.trim()) return 'Nama lengkap wajib diisi';
			if (!linkedin.trim()) return 'LinkedIn URL wajib diisi';
			if (!linkedin.startsWith('http')) return 'LinkedIn harus diawali https://';
		}
		if (s === 2) {
			if (!province) return 'Pilih provinsi';
			if (!city) return 'Pilih kota/kabupaten';
			if (!field) return 'Pilih bidang keahlian';
		}
		return '';
	}

	function next() {
		const err = validateStep(step);
		if (err) { error = err; return; }
		error = '';
		step++;
	}

	async function submit() {
		error = '';
		loading = true;
		try {
			const res = await api.registerUser({ name, linkedin, province, city, field, sub_field, details, portfolio });
			successId = res.id;
			auth.login(res.id, name);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Terjadi kesalahan';
		} finally {
			loading = false;
		}
	}

	// Login modal
	let showLoginModal = $state(false);
	let loginId = $state('');
	let loginError = $state('');
	let loginLoading = $state(false);

	async function submitLogin() {
		loginError = '';
		loginLoading = true;
		try {
			const valid = await api.verifyUser(loginId.trim());
			if (valid) {
				const user = await api.getUserById(loginId.trim());
				auth.login(loginId.trim(), user?.name);
				goto('/edit-profile');
			} else {
				loginError = 'ID tidak ditemukan. Pastikan ID yang kamu masukkan benar.';
			}
		} catch {
			loginError = 'Terjadi kesalahan. Coba lagi.';
		} finally {
			loginLoading = false;
		}
	}

	async function copyId() {
		await navigator.clipboard.writeText(successId);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	const stepTitles = ['Info Dasar', 'Lokasi & Keahlian', 'Detail Profil'];
</script>

<svelte:head>
	<title>Daftar — FreelancerID</title>
</svelte:head>

<div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
	<div class="w-full max-w-md">
		{#if successId}
			<!-- Success screen -->
			<div class="card p-8 text-center">
				<div class="w-16 h-16 rounded-full bg-green-900/50 border border-green-700/50 flex items-center justify-center mx-auto mb-5">
					<svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
				</div>
				<h1 class="text-2xl font-bold text-white mb-2">Berhasil Daftar!</h1>
				<p class="text-gray-400 mb-6 text-sm">Ini adalah ID unikmu. Simpan baik-baik — ini satu-satunya cara untuk login kembali.</p>

				<div class="bg-gray-800 rounded-xl p-4 mb-6">
					<div class="text-xs text-gray-500 mb-2 uppercase tracking-wide">ID Aksesmu</div>
					<div class="font-mono text-2xl font-bold tracking-widest text-brand-400">{successId}</div>
				</div>

				<div class="flex flex-col gap-3">
					<button onclick={copyId} class="btn-secondary w-full justify-center">
						{#if copied}
							<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
							Tersalin!
						{:else}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
							Salin ID
						{/if}
					</button>
					<a href="/directory" class="btn-primary w-full justify-center">Jelajahi Direktori</a>
				</div>

				<div class="mt-6 p-3 rounded-xl bg-yellow-900/30 border border-yellow-700/40 text-yellow-300 text-xs text-left">
					<strong>Perhatian:</strong> Jangan sampai kehilangan ID ini. Tidak ada cara reset jika hilang.
				</div>
			</div>
		{:else}
			<!-- Step indicator -->
			<div class="mb-6">
				<div class="flex items-center justify-between mb-2">
					<h1 class="text-xl font-bold text-white">Daftar Freelancer</h1>
					<span class="text-sm text-gray-500">{step}/3</span>
				</div>
				<div class="flex gap-1.5">
					{#each [1, 2, 3] as s}
						<div class="h-1 flex-1 rounded-full transition-all {s <= step ? 'bg-brand-500' : 'bg-gray-800'}"></div>
					{/each}
				</div>
				<p class="text-sm text-gray-500 mt-2">{stepTitles[step - 1]}</p>
			</div>

			<div class="card p-6 sm:p-8">
				{#if error}
					<div class="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-sm">{error}</div>
				{/if}

				<!-- Step 1 -->
				{#if step === 1}
					<div class="space-y-5">
						<div>
							<label class="label" for="name">Nama Lengkap <span class="text-red-400">*</span></label>
							<input id="name" class="input" type="text" bind:value={name} placeholder="John Doe" maxlength="100" />
						</div>
						<div>
							<label class="label" for="linkedin">LinkedIn URL <span class="text-red-400">*</span></label>
							<input id="linkedin" class="input" type="url" bind:value={linkedin} placeholder="https://linkedin.com/in/johndoe" />
							<p class="text-xs text-gray-500 mt-1.5">Dienkripsi dan hanya terlihat oleh anggota terdaftar</p>
						</div>
					</div>

				<!-- Step 2 -->
				{:else if step === 2}
					<div class="space-y-5">
						<div>
							<label class="label" for="province">Provinsi <span class="text-red-400">*</span></label>
							<select id="province" class="select" bind:value={province}>
								<option value="">-- Pilih Provinsi --</option>
								{#each provinces as p}
									<option value={p}>{p}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="label" for="city">Kota / Kabupaten <span class="text-red-400">*</span></label>
							<select id="city" class="select" bind:value={city} disabled={!province}>
								<option value="">-- Pilih Kota --</option>
								{#each cities as c}
									<option value={c}>{c}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="label" for="field">Bidang Keahlian <span class="text-red-400">*</span></label>
							<select id="field" class="select" bind:value={field}>
								<option value="">-- Pilih Bidang --</option>
								{#each DISCIPLINES as d}
									<option value={d}>{d}</option>
								{/each}
							</select>
						</div>
					</div>

				<!-- Step 3 -->
				{:else}
					<div class="space-y-5">
						<div>
							<label class="label" for="sub_field">Sub-spesialisasi <span class="text-gray-500 text-xs">(opsional)</span></label>
							<input id="sub_field" class="input" type="text" bind:value={sub_field} placeholder="e.g. React, Laravel, Motion Graphics" maxlength="100" />
						</div>
						<div>
							<label class="label" for="details">Bio / Keahlian <span class="text-gray-500 text-xs">(opsional)</span></label>
							<textarea id="details" class="textarea" rows="4" bind:value={details} placeholder="Ceritakan keahlian, pengalaman, atau spesialisasimu..." maxlength="1000"></textarea>
							<p class="text-xs text-gray-500 mt-1">{details.length}/1000</p>
						</div>
						<div>
							<label class="label" for="portfolio">Portfolio URL <span class="text-gray-500 text-xs">(opsional)</span></label>
							<input id="portfolio" class="input" type="url" bind:value={portfolio} placeholder="https://portofoliomu.com" />
						</div>
					</div>
				{/if}

				<!-- Navigation -->
				<div class="flex gap-3 mt-7">
					{#if step > 1}
						<button class="btn-secondary flex-1 justify-center" onclick={() => { step--; error = ''; }}>Kembali</button>
					{/if}
					{#if step < 3}
						<button class="btn-primary flex-1 justify-center" onclick={next}>Lanjut</button>
					{:else}
						<button class="btn-primary flex-1 justify-center" onclick={submit} disabled={loading}>
							{#if loading}
								<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
								Mendaftar...
							{:else}
								Daftar Sekarang
							{/if}
						</button>
					{/if}
				</div>
			</div>

			<p class="text-center text-sm text-gray-500 mt-4">
				Sudah punya ID?
				<button class="text-brand-400 hover:text-brand-300 underline" onclick={() => (showLoginModal = true)}>
					Masuk di sini
				</button>
			</p>
		{/if}
	</div>
</div>

<!-- Login modal -->
{#if showLoginModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true">
		<div class="card p-6 w-full max-w-sm">
			<h2 class="text-lg font-bold text-white mb-1">Masuk dengan ID</h2>
			<p class="text-sm text-gray-400 mb-5">Masukkan ID 10 karakter yang kamu dapat saat daftar</p>
			{#if loginError}
				<div class="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-sm">{loginError}</div>
			{/if}
			<input
				class="input mb-3 font-mono text-center text-lg tracking-widest"
				maxlength="10"
				placeholder="ID Aksesmu"
				bind:value={loginId}
				onkeydown={(e) => e.key === 'Enter' && submitLogin()}
			/>
			<div class="flex gap-2">
				<button class="btn-secondary flex-1 justify-center" onclick={() => { showLoginModal = false; loginError = ''; loginId = ''; }}>Batal</button>
				<button class="btn-primary flex-1 justify-center" onclick={submitLogin} disabled={loginLoading || loginId.length < 3}>
					{loginLoading ? 'Memeriksa...' : 'Masuk'}
				</button>
			</div>
		</div>
	</div>
{/if}
