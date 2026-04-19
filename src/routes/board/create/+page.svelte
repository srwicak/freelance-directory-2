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
	let link_url = $state('');
	let budget = $state('');
	let project_duration = $state('');
	let availability = $state('');
	let days = $state(14);
	let loading = $state(false);
	let error = $state('');

	// Tag input — max 5 skills
	const MAX_SKILLS = 5;
	let tags = $state<string[]>([]);
	let tagInput = $state('');
	let canAddMore = $derived(tags.length < MAX_SKILLS);

	function addTag() {
		const val = tagInput.trim();
		if (!val || !canAddMore) return;
		if (tags.includes(val)) { tagInput = ''; return; }
		tags = [...tags, val];
		tagInput = '';
	}

	function removeTag(i: number) {
		tags = tags.filter((_, idx) => idx !== i);
	}

	function onTagKeydown(e: KeyboardEvent) {
		if (e.key === ',' || e.key === 'Enter') {
			e.preventDefault();
			addTag();
		} else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
			tags = tags.slice(0, -1);
		}
	}

	let skillsString = $derived(tags.join(','));

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
				link_url: link_url.trim() || undefined,
				required_skills: skillsString || undefined,
				budget: budget.trim() || undefined,
				project_duration: type === 'JOB' ? (project_duration || undefined) : undefined,
				availability: type === 'TALENT' ? (availability || undefined) : undefined,
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

		<!-- Type toggle -->
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
			<input id="title" class="input" type="text" bind:value={title}
				placeholder={type === 'JOB' ? 'e.g. Butuh Web Developer React.js' : 'e.g. Desainer Logo & Brand Identity'}
				maxlength="150" />
			<p class="text-xs text-gray-500 mt-1">{title.length}/150</p>
		</div>

		<!-- Description -->
		<div>
			<label class="label" for="desc">Deskripsi <span class="text-red-400">*</span></label>
			<textarea id="desc" class="textarea" rows="6" bind:value={description}
				placeholder={type === 'JOB'
					? 'Jelaskan kebutuhan proyek, scope pekerjaan, timeline, dan cara melamar...'
					: 'Jelaskan layanan yang kamu tawarkan, pengalaman, proses kerja, dan cara menghubungimu...'}
				maxlength="3000"></textarea>
			<p class="text-xs text-gray-500 mt-1">{description.length}/3000</p>
		</div>

		<!-- Kategori -->
		<div>
			<label class="label" for="field">Kategori Keahlian <span class="text-gray-500 text-xs">(opsional)</span></label>
			<select id="field" class="select" bind:value={field}>
				<option value="">-- Pilih Kategori --</option>
				{#each DISCIPLINES as d}
					<option value={d}>{d}</option>
				{/each}
			</select>
		</div>

		<!-- Skills -->
		<div>
			<label class="label" for="tag-input">
				{type === 'JOB' ? 'Keahlian yang Dibutuhkan' : 'Keahlian yang Ditawarkan'}
				<span class="text-gray-500 text-xs">(opsional · {tags.length}/{MAX_SKILLS})</span>
			</label>
			<div class="flex flex-wrap gap-1.5 p-3 rounded-xl bg-gray-800 border border-gray-700 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all min-h-[48px]">
				{#each tags as tag, i}
					<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-900/70 text-brand-300 border border-brand-700/50">
						{tag}
						<button type="button" onclick={() => removeTag(i)} class="text-brand-400 hover:text-white leading-none">×</button>
					</span>
				{/each}
				{#if canAddMore}
					<input
						id="tag-input"
						type="text"
						class="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-100 placeholder-gray-500"
						placeholder={tags.length === 0 ? 'Ketik lalu tekan Enter atau koma...' : 'Tambah keahlian...'}
						bind:value={tagInput}
						onkeydown={onTagKeydown}
						onblur={addTag}
					/>
				{:else}
					<span class="text-xs text-gray-500 self-center">Maks {MAX_SKILLS} keahlian tercapai</span>
				{/if}
			</div>
		</div>

		<!-- Budget (label berbeda per tipe) -->
		<div>
			<label class="label" for="budget">
				{type === 'JOB' ? 'Budget Proyek' : 'Rate / Harga Jasa'}
				<span class="text-gray-500 text-xs">(opsional)</span>
			</label>
			<input id="budget" class="input" type="text" bind:value={budget}
				placeholder={type === 'JOB' ? 'mis. "Rp 5jt", "$500-1000", "Nego"' : 'mis. "Rp 500rb/jam", "$50/hr", "Rp 3jt/proyek"'}
				maxlength="60" />
			<p class="text-xs text-gray-500 mt-1">{budget.length}/60</p>
		</div>

		<!-- JOB-only: Durasi Proyek -->
		{#if type === 'JOB'}
			<div>
				<label class="label" for="proj-duration">Durasi Proyek <span class="text-gray-500 text-xs">(opsional)</span></label>
				<select id="proj-duration" class="select" bind:value={project_duration}>
					<option value="">-- Pilih Durasi --</option>
					<option value="< 1 minggu">Kurang dari 1 minggu</option>
					<option value="1–4 minggu">1–4 minggu</option>
					<option value="1–3 bulan">1–3 bulan</option>
					<option value="> 3 bulan">Lebih dari 3 bulan</option>
					<option value="Ongoing">Ongoing / Jangka panjang</option>
				</select>
			</div>
		{/if}

		<!-- TALENT-only: Ketersediaan -->
		{#if type === 'TALENT'}
			<div>
				<label class="label" for="availability">Ketersediaan <span class="text-gray-500 text-xs">(opsional)</span></label>
				<select id="availability" class="select" bind:value={availability}>
					<option value="">-- Pilih Ketersediaan --</option>
					<option value="Full-time">Full-time</option>
					<option value="Part-time">Part-time</option>
					<option value="Per Proyek">Per Proyek</option>
					<option value="Fleksibel">Fleksibel</option>
				</select>
			</div>
		{/if}

		<!-- Link (label berbeda per tipe) -->
		<div>
			<label class="label" for="link">
				{type === 'JOB' ? 'Link Brief / Pekerjaan' : 'Link Portfolio'}
				<span class="text-gray-500 text-xs">(opsional)</span>
			</label>
			<input id="link" class="input" type="url" bind:value={link_url} placeholder="https://..." />
			<p class="text-xs text-gray-500 mt-1">
				{type === 'JOB' ? 'Link ke detail proyek, brief, atau halaman rekrutmen' : 'Link ke portfolio, Behance, Dribbble, atau website kamu'}
			</p>
		</div>

		<!-- Image URL -->
		<div>
			<label class="label" for="img">URL Gambar <span class="text-gray-500 text-xs">(opsional)</span></label>
			<input id="img" class="input" type="url" bind:value={image_url} placeholder="https://i.ibb.co/example.jpg" />
			<p class="text-xs text-gray-500 mt-1">Upload ke ImgBB atau layanan serupa, lalu paste URL-nya</p>
		</div>

		<!-- Durasi Tayang -->
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
