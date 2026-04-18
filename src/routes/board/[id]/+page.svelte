<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth.svelte';
	import { api } from '$lib/rpc';

	type Post = {
		id: string; type: string; title: string; description: string;
		field: string | null; image_url: string | null; link_url: string | null;
		required_skills: string | null; budget: string | null; created_at: number;
		expires_at: number; edit_count: number; thumbs_up: number; thumbs_down: number;
		user_id: string;
		author: { id: string; name: string; field: string; province: string; city: string; linkedin: string; portfolio: string | null; details: string | null } | null;
	};

	let post = $state<Post | null>(null);
	let loading = $state(true);
	let notFound = $state(false);
	let userVote = $state(0);
	let voteLoading = $state(false);
	let showDelete = $state(false);
	let deleting = $state(false);
	let showEdit = $state(false);

	// Edit form
	let editTitle = $state('');
	let editDesc = $state('');
	let editField = $state('');
	let editImg = $state('');
	let editLink = $state('');
	let editBudget = $state('');
	let editError = $state('');
	let editLoading = $state(false);

	// Tag input for edit
	const MAX_SKILLS = 5;
	let editTags = $state<string[]>([]);
	let editTagInput = $state('');
	let editCanAdd = $derived(editTags.length < MAX_SKILLS);
	let editSkillsString = $derived(editTags.join(','));

	function addEditTag() {
		const val = editTagInput.trim();
		if (!val || !editCanAdd) return;
		if (editTags.includes(val)) { editTagInput = ''; return; }
		editTags = [...editTags, val];
		editTagInput = '';
	}
	function removeEditTag(i: number) { editTags = editTags.filter((_, idx) => idx !== i); }
	function onEditTagKeydown(e: KeyboardEvent) {
		if (e.key === ',' || e.key === 'Enter') { e.preventDefault(); addEditTag(); }
		else if (e.key === 'Backspace' && editTagInput === '' && editTags.length > 0) editTags = editTags.slice(0, -1);
	}

	const postId = page.params.id ?? '';
	const isOwner = $derived(!!auth.userId && !!post && auth.userId === post.user_id);

	onMount(async () => {
		try {
			const res = await api.getOpportunityById(postId);
			if (!res) { notFound = true; return; }
			post = res;
			if (auth.userId) userVote = await api.getUserVote(postId, auth.userId as string);
		} finally {
			loading = false;
		}
	});

	async function vote(v: 1 | -1) {
		if (!auth.userId || !post) return;
		const uid = auth.userId as string;
		voteLoading = true;
		try {
			await api.voteOpportunity(postId, uid, v);
			const updated = await api.getOpportunityById(postId);
			if (updated) post = updated;
			userVote = await api.getUserVote(postId, uid);
		} finally {
			voteLoading = false; }
	}

	async function deletePost() {
		if (!auth.userId || !post) return;
		deleting = true;
		try {
			await api.deleteOpportunity(postId, auth.userId as string);
			goto('/board');
		} catch (e: unknown) {
			alert(e instanceof Error ? e.message : 'Gagal menghapus');
			deleting = false;
		}
	}

	function startEdit() {
		if (!post) return;
		editTitle = post.title;
		editDesc = post.description;
		editField = post.field ?? '';
		editImg = post.image_url ?? '';
		editLink = post.link_url ?? '';
		editBudget = post.budget ?? '';
		editTags = post.required_skills
			? post.required_skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5)
			: [];
		editTagInput = '';
		showEdit = true;
	}

	async function submitEdit() {
		if (!auth.userId || !post) return;
		if (!editTitle.trim() || !editDesc.trim()) { editError = 'Judul dan deskripsi wajib diisi'; return; }
		editError = '';
		editLoading = true;
		try {
			await api.editOpportunity(postId, auth.userId as string, { title: editTitle, description: editDesc, field: editField, image_url: editImg, link_url: editLink, required_skills: editSkillsString || undefined, budget: editBudget.trim() || undefined });
			const updated = await api.getOpportunityById(postId);
			if (updated) post = updated;
			showEdit = false;
		} catch (e: unknown) {
			editError = e instanceof Error ? e.message : 'Gagal menyimpan';
		} finally {
			editLoading = false;
		}
	}

	function getBadges() {
		if (!post) return [];
		const badges: { label: string; cls: string }[] = [];
		if (post.thumbs_up >= 25) badges.push({ label: 'Trusted', cls: 'badge-green' });
		else if (post.thumbs_up >= 10) badges.push({ label: 'Populer', cls: 'badge-blue' });
		if (post.thumbs_down >= 10) badges.push({ label: 'Warning', cls: 'badge-red' });
		else if (post.thumbs_down >= 5) badges.push({ label: 'Warning', cls: 'badge-yellow' });
		return badges;
	}

	function daysLeft(ts: number) {
		const diff = ts - Date.now() / 1000;
		if (diff <= 0) return 'Kedaluwarsa';
		return `${Math.ceil(diff / 86400)} hari lagi`;
	}

	function formatDate(ts: number) {
		return new Date(ts * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>{post?.title ?? 'Postingan'} — FreelancerID</title>
</svelte:head>

<!-- Edit modal -->
{#if showEdit && post}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
		<div class="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
			<h2 class="text-lg font-bold text-white mb-4">Edit Postingan ({3 - post.edit_count} edit tersisa)</h2>
			{#if editError}
				<div class="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-sm">{editError}</div>
			{/if}
			<div class="space-y-4">
				<div>
					<label class="label" for="edit-title">Judul</label>
					<input id="edit-title" class="input" bind:value={editTitle} maxlength="150" />
				</div>
				<div>
					<label class="label" for="edit-desc">Deskripsi</label>
					<textarea id="edit-desc" class="textarea" rows="5" bind:value={editDesc} maxlength="3000"></textarea>
				</div>
				<div>
					<label class="label" for="edit-tag-input">
						Keahlian
						<span class="text-gray-500 text-xs">(opsional · {editTags.length}/{MAX_SKILLS})</span>
					</label>
					<div class="flex flex-wrap gap-1.5 p-3 rounded-xl bg-gray-800 border border-gray-700 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all min-h-[48px]">
						{#each editTags as tag, i}
							<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-900/70 text-brand-300 border border-brand-700/50">
								{tag}
								<button type="button" onclick={() => removeEditTag(i)} class="text-brand-400 hover:text-white leading-none">×</button>
							</span>
						{/each}
						{#if editCanAdd}
							<input
								id="edit-tag-input"
								type="text"
								class="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-100 placeholder-gray-500"
								placeholder={editTags.length === 0 ? 'Ketik lalu tekan Enter atau koma...' : 'Tambah keahlian...'}
								bind:value={editTagInput}
								onkeydown={onEditTagKeydown}
								onblur={addEditTag}
							/>
						{:else}
							<span class="text-xs text-gray-500 self-center">Maks {MAX_SKILLS} keahlian tercapai</span>
						{/if}
					</div>
				</div>
				<div>
					<label class="label" for="edit-budget">Budget / Rate</label>
					<input id="edit-budget" class="input" type="text" bind:value={editBudget} placeholder='mis. "Rp 5jt/proyek", "$50-80/jam"' maxlength="60" />
				</div>
				<div>
					<label class="label" for="edit-link">Link Pekerjaan</label>
					<input id="edit-link" class="input" type="url" bind:value={editLink} placeholder="https://..." />
				</div>
				<div>
					<label class="label" for="edit-img">URL Gambar</label>
					<input id="edit-img" class="input" bind:value={editImg} placeholder="https://..." />
				</div>
			</div>
			<div class="flex gap-2 mt-5">
				<button class="btn-secondary flex-1 justify-center" onclick={() => (showEdit = false)}>Batal</button>
				<button class="btn-primary flex-1 justify-center" onclick={submitEdit} disabled={editLoading}>
					{editLoading ? 'Menyimpan...' : 'Simpan'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Delete confirm -->
{#if showDelete}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
		<div class="card p-6 w-full max-w-sm text-center">
			<svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
			<h2 class="text-lg font-bold text-white mb-2">Hapus Postingan?</h2>
			<p class="text-sm text-gray-400 mb-6">Tindakan ini tidak bisa dibatalkan.</p>
			<div class="flex gap-2">
				<button class="btn-secondary flex-1 justify-center" onclick={() => (showDelete = false)}>Batal</button>
				<button class="btn-primary flex-1 justify-center bg-red-600 hover:bg-red-500" onclick={deletePost} disabled={deleting}>
					{deleting ? 'Menghapus...' : 'Hapus'}
				</button>
			</div>
		</div>
	</div>
{/if}

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
	<a href="/board" class="btn-ghost text-sm mb-6 -ml-2">
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
		Kembali
	</a>

	{#if loading}
		<div class="card p-8 animate-pulse">
			<div class="h-6 bg-gray-800 rounded mb-4 w-3/4"></div>
			<div class="space-y-3">
				<div class="h-4 bg-gray-800 rounded"></div>
				<div class="h-4 bg-gray-800 rounded w-4/5"></div>
				<div class="h-4 bg-gray-800 rounded w-3/5"></div>
			</div>
		</div>
	{:else if notFound || !post}
		<div class="card p-10 text-center">
			<p class="text-gray-400">Postingan tidak ditemukan atau sudah kedaluwarsa.</p>
			<a href="/board" class="btn-primary mt-4">Lihat semua postingan</a>
		</div>
	{:else}
		<div class="card p-6 sm:p-8">
			<!-- Header -->
			<div class="flex flex-wrap items-start gap-2 mb-4">
				<span class="badge {post.type === 'JOB' ? 'badge-blue' : 'badge-purple'}">
					{post.type === 'JOB' ? 'Butuh Freelancer' : 'Tawarkan Jasa'}
				</span>
				{#each getBadges() as b}
					<span class={b.cls}>{b.label}</span>
				{/each}
				{#if post.field}
					<span class="badge bg-gray-800 text-gray-400 border border-gray-700">{post.field}</span>
				{/if}
			</div>

			<h1 class="text-2xl font-bold text-white mb-3">{post.title}</h1>

			<!-- Budget -->
			{#if post.budget}
				<div class="inline-flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-lg bg-green-900/30 border border-green-700/40 text-green-300 text-sm font-medium">
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
					{post.budget}
				</div>
			{/if}

			<!-- Image -->
			{#if post.image_url}
				<img src={post.image_url} alt="Post" class="w-full rounded-xl mb-6 max-h-64 object-cover" />
			{/if}

			<!-- Skills -->
			{#if post.required_skills}
				<div class="mb-5">
					<p class="text-xs text-gray-500 uppercase tracking-wide mb-2">
						{post.type === 'JOB' ? 'Keahlian yang Dibutuhkan' : 'Keahlian yang Ditawarkan'}
					</p>
					<div class="flex flex-wrap gap-1.5">
						{#each post.required_skills.split(',').filter(Boolean) as skill}
							<span class="badge-purple">{skill.trim()}</span>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Description: JOB posts hide for non-login -->
			{#if post.type === 'JOB' && !auth.userId}
				<div class="relative mb-5">
					<div class="text-gray-300 leading-relaxed whitespace-pre-wrap line-clamp-3 select-none blur-sm pointer-events-none">{post.description}</div>
					<div class="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/60 rounded-xl backdrop-blur-[2px]">
						<p class="text-sm text-gray-300 font-medium mb-3">Masuk untuk membaca deskripsi lengkap</p>
						<a href="/register" class="btn-primary text-sm">Daftar / Masuk</a>
					</div>
				</div>
			{:else}
				<div class="text-gray-300 leading-relaxed whitespace-pre-wrap mb-5">{post.description}</div>
			{/if}

			<!-- Link pekerjaan: hide for non-login on JOB posts -->
			{#if post.link_url}
				{#if post.type === 'JOB' && !auth.userId}
					<div class="inline-flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-500 text-sm cursor-not-allowed select-none">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
						Link tersedia setelah login
					</div>
				{:else}
					<a
						href={post.link_url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl bg-brand-900/40 border border-brand-700/50 text-brand-300 text-sm hover:bg-brand-900/60 transition-colors"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
						Lihat Detail Pekerjaan
					</a>
				{/if}
			{/if}

			<!-- Meta -->
			<div class="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1 mb-6">
				<span>Diposting: {formatDate(post.created_at)}</span>
				<span>Berlaku: {daysLeft(post.expires_at)}</span>
				{#if post.edit_count > 0}<span>Diedit {post.edit_count}x</span>{/if}
			</div>

			<!-- Voting -->
			<div class="flex items-center gap-3 py-4 border-y border-gray-800 mb-6">
				<span class="text-sm text-gray-400">Nilai postingan ini:</span>
				<button
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all {userVote === 1 ? 'bg-green-900/50 text-green-400 border border-green-700/50' : 'bg-gray-800 text-gray-400 hover:text-green-400'}"
					onclick={() => vote(1)}
					disabled={voteLoading || !auth.userId}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
					{post.thumbs_up}
				</button>
				<button
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all {userVote === -1 ? 'bg-red-900/50 text-red-400 border border-red-700/50' : 'bg-gray-800 text-gray-400 hover:text-red-400'}"
					onclick={() => vote(-1)}
					disabled={voteLoading || !auth.userId}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"/></svg>
					{post.thumbs_down}
				</button>
				{#if !auth.userId}
					<span class="text-xs text-gray-600">Login untuk voting</span>
				{/if}
			</div>

			<!-- Author -->
			{#if post.author}
				<div class="card p-5 mb-6">
					<h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Pembuat Postingan</h2>
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
							{post.author.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
						</div>
						<div>
							<p class="font-semibold text-gray-100">{post.author.name}</p>
							<p class="text-sm text-gray-500">{post.author.field} · {post.author.city}, {post.author.province}</p>
						</div>
					</div>
					{#if auth.userId}
						<div class="flex gap-2 mt-4">
							<a href={post.author.linkedin} target="_blank" rel="noopener noreferrer" class="btn-secondary text-sm py-2">
								LinkedIn
							</a>
							{#if post.author.portfolio}
								<a href={post.author.portfolio} target="_blank" rel="noopener noreferrer" class="btn-ghost text-sm">Portfolio</a>
							{/if}
						</div>
					{:else}
						<div class="mt-4 p-3 rounded-xl bg-gray-800/60 border border-gray-700 flex items-center justify-between gap-3">
							<p class="text-sm text-gray-400">
								{post.type === 'TALENT' ? 'Daftar untuk melihat kontak & cara menghubungi' : 'Masuk untuk melihat kontak pembuat'}
							</p>
							<a href="/register" class="btn-primary text-xs py-1.5 px-3 whitespace-nowrap">Daftar / Masuk</a>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Owner actions -->
			{#if isOwner}
				<div class="flex gap-2 pt-4 border-t border-gray-800">
					<button
						class="btn-secondary text-sm"
						onclick={startEdit}
						disabled={post.edit_count >= 3}
					>
						{post.edit_count >= 3 ? 'Edit habis (3/3)' : `Edit (${post.edit_count}/3)`}
					</button>
					<button
						class="btn-ghost text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20"
						onclick={() => (showDelete = true)}
					>Hapus</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
